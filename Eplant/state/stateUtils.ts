import { z, ZodTypeAny } from 'zod'

export const validateType = (
  schema: z.ZodObject<any>,
  obj: Record<string, any>
): boolean => {
  const schemaKeys = Object.keys(schema.shape)
  const objKeys = Object.keys(obj)

  return (
    schemaKeys.length === objKeys.length &&
    schemaKeys.every((key) => objKeys.includes(key))
  )
}

export const getStateFromParams = <T extends ZodTypeAny>(
  schema: T,
  params: URLSearchParams
): Partial<z.infer<T>> => {
  if (!params.size) return {}
  const rawObject: Record<string, unknown> = {} // This will get mutated by `extractParams`
  const parseValue = (value: string, schema: ZodTypeAny): unknown => {
    if (schema instanceof z.ZodNumber) {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? undefined : parsed
    } else if (schema instanceof z.ZodArray) {
      return value.split(',').map((v) => parseValue(v, schema._def.type))
    } else if (schema instanceof z.ZodString || schema instanceof z.ZodEnum) {
      return value
    } else if (schema instanceof z.ZodBoolean) {
      if (value === 'true') return true
      else if (value === 'false') return false
      else return undefined
    }
    return undefined
  }

  const extractParams = (schema: ZodTypeAny, path: string[] = []) => {
    if (schema instanceof z.ZodObject) {
      Object.entries(schema.shape).forEach(([key, subSchema]) =>
        extractParams(subSchema as ZodTypeAny, [...path, key])
      )
    } else if (schema instanceof z.ZodDefault) {
      const paramKey = path.join('.')
      const value = params.get(paramKey)
      if (value !== null) {
        rawObject[paramKey] = parseValue(value, schema._def.innerType) // Getting actual type of value
      }
    }
  }
  extractParams(schema)
  const result = schema.safeParse(unflattenObject(rawObject))
  return result.success ? result.data : {}
}

export const getZodDefaults = <Schema extends z.ZodTypeAny>(
  schema: Schema
): z.infer<Schema> => {
  const extractDefaults = (schema: z.ZodTypeAny): any => {
    if (schema instanceof z.ZodObject) {
      return Object.fromEntries(
        Object.entries(schema.shape).map(([key, value]) => [
          key,
          extractDefaults(value as z.ZodTypeAny),
        ])
      )
    } else if (schema instanceof z.ZodDefault) {
      return schema._def.defaultValue()
    }
    return undefined
  }

  if (!(schema instanceof z.ZodObject)) {
    throw new Error('Schema must be a Zod object')
  }

  return extractDefaults(schema)
}

export const flattenObject = (
  obj: Record<string, any>,
  prefix: string | null = null,
  result: Record<string, string> = {}
): Record<string, string> => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flattenObject(obj[key], newKey, result)
      } else {
        result[newKey] = obj[key].toString()
      }
    }
  }
  return result
}

export const unflattenObject = (
  obj: Record<string, unknown>
): Record<string, any> => {
  const result: Record<string, any> = {}
  for (const key in obj) {
    const keys = key.split('.')
    let current = result
    for (let i = 0; i < keys.length; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = i === keys.length - 1 ? obj[key] : {}
      }
      current = current[keys[i]]
    }
  }
  return result
}
