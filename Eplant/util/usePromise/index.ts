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

  // Keep track of how many .thens() have been created
  // If a callback gets called it can check if it's the
  // current active promise
  const callbackCount = React.useRef<number>(0)

  React.useEffect(() => {
    setValue(null)
    setLoading(true)
    setErr(null)
    callbackCount.current++
    const currentCount = callbackCount.current
    promise
      .then((val) => {
        if (callbackCount.current == currentCount) {
          setValue(val)
          setLoading(false)
          setErr(null)
        }
      })
      .catch((err) => {
        if (callbackCount.current == currentCount) {
          setValue(null)
          setLoading(false)
          setErr(err)
        }
      })
  }, [promise])

  return [value, loading, err]
}
