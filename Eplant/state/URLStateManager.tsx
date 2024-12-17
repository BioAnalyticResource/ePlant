import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { debounce } from 'lodash'
import { useSearchParams } from 'react-router-dom'
import { AnyZodObject, z, ZodObject, ZodTypeAny } from 'zod'

import { useActiveViewId } from '.'

const flattenObject = (
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

const unflattenObject = (obj: Record<string, unknown>): Record<string, any> => {
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

interface URLStateContext<T> {
  state: T | null
  setState: (updatedState: T) => void
  initializeState: (schema: AnyZodObject) => void
}

const URLStateContext = createContext<URLStateContext<any>>({
  state: null,
  setState: () => {
    throw new Error('setState must be used within a URLStateProvider')
  },
  initializeState: () => {
    throw new Error('initializeState must be used within a URLStateProvider')
  },
})

export const URLStateProvider = ({ children }: { children: ReactNode }) => {
  const [activeViewId, setActiveViewId] = useActiveViewId()
  const [searchParams, setSearchParams] = useSearchParams()
  const stateCache = useRef(new Map<string, any>())

  const [state, setState] = useState<any>(() => {
    null
  })

  useEffect(() => {
    const cachedState = stateCache.current.get(activeViewId)
    if (cachedState) {
      setState(cachedState)
    }
  }, [activeViewId])

  useEffect(() => {
    if (state) {
      stateCache.current.set(activeViewId, state)
    }
  }, [])

  const debouncedUpdateState = useCallback(
    debounce((updatedState: any) => {
      // Setting component state
      stateCache.current.set(activeViewId, state)

      // Setting params
      const flattenedState = flattenObject(updatedState)
      setSearchParams(new URLSearchParams(flattenedState as any))
    }, 50),
    [setSearchParams]
  )

  useEffect(() => {
    if (state) {
      debouncedUpdateState(state)
    }
    return () => {
      debouncedUpdateState.cancel()
    }
  }, [state, debouncedUpdateState])

  const initializeState = useCallback(
    <T extends AnyZodObject>(schema: T) => {
      // Get validated state
      const defaultState = getZodDefaults(schema) // This returns the defaults defined by Zod Schema

      const paramsState = getStateFromParams(schema, searchParams)
      const cachedState = stateCache.current.get(activeViewId) || {}
      // Merge precedence: search params > cached state > defaults
      const mergedState = {
        ...defaultState,
        ...cachedState,
        ...paramsState,
      }
      setState(mergedState)
    },
    [searchParams, activeViewId]
  )

  const handleSetState = useCallback(
    (updatedState: any) => {
      setState(updatedState)
    },
    [setState]
  )

  return (
    <URLStateContext.Provider
      value={{ state, setState: handleSetState, initializeState }}
    >
      {children}
    </URLStateContext.Provider>
  )
}

export const useURLState = <T,>() => {
  const context = useContext(URLStateContext)
  if (!context.setState) {
    throw new Error('useURLState must be used within a URLStateProvider')
  }
  return context as URLStateContext<T>
}

export const getStateFromParams = <T extends ZodTypeAny>(
  schema: T,
  params: URLSearchParams
): Partial<z.infer<T>> => {
  const rawObject: Record<string, unknown> = {} // This will get mutated by `extractParams`
  const parseValue = (value: string, schema: ZodTypeAny): unknown => {
    if (schema instanceof z.ZodNumber) {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? undefined : parsed
    } else if (schema instanceof z.ZodString) {
      return value
    } else if (schema instanceof z.ZodBoolean) {
      return value === 'true'
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

const getZodDefaults = <Schema extends z.ZodTypeAny>(
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
