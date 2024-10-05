export const flattenState = (
  obj: { [key: string]: any },
  res: { [key: string]: any } = {}
) => {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenState(obj[key], res)
    } else {
      res[key] = obj[key]
    }
  }
  return res
}
