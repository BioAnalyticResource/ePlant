import * as React from 'react'
/**
 * Hook for making dealing with promises simpler.
 * Returns a value for whether or not the promise is still loading,
 * the value it has returned, and an error
 *
 * @export
 * @template T The type returned by the promise
 * @param {Promise<T>} promise
 * @return {*}  {([T | null, boolean, Error | null])}
 */
export default function usePromise<T>(
  promise: Promise<T>
): [T | null, boolean, Error | null] {
  const [value, setValue] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [err, setErr] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let listening = true
    setValue(null)
    setLoading(true)
    setErr(null)
    promise
      .then((val) => {
        if (listening) {
          setValue(val)
          setLoading(false)
          setErr(null)
        }
      })
      .catch((err) => {
        if (listening) {
          setValue(null)
          setLoading(false)
          setErr(err)
        }
      })
    return () => {
      listening = false
    }
  }, [promise])

  return [value, loading, err]
}
