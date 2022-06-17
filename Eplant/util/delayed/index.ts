export default {
  // Return a promise that resolves to `val` after `ms` ms
  async value<T>(val: T, ms: number): Promise<T> {
    return await new Promise<T>((res, rej) => {
      setTimeout(() => res(val), ms)
    })
  },
  // Return a promise that resolves to `method()` after `ms` ms
  async call<T>(method: () => T, ms: number): Promise<T> {
    return await new Promise<T>((res, rej) => {
      setTimeout(() => {
        try {
          res(method())
        } catch (e) {
          rej(e)
        }
      }, ms)
    })
  },
}
