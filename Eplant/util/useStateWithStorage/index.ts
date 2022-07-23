import { usePersist } from '@eplant/state'
import { type Dispatch, type SetStateAction, useState, useEffect } from 'react'

/**
 * A a hook like `useState` that stores the state in local storage.
 * @param key The key to store the state in localStorage
 * @param initial The initial state
 * @returns [state, setState] where state is the current state and setState is a function to set the state
 */
export default function useStateWithStorage<T>(key: string, initial: T): [T, (a: SetStateAction<T>) => void] {
  const persist = usePersist()[0]
  const [val, setVal] = useState<T>(
    JSON.parse(localStorage.getItem(key) ?? 'null') ?? initial
  )

  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === key) {
        if (persist) setVal(JSON.parse(event.newValue ?? 'null') ?? initial)
        console.log(event)
      }
    }
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }, [key])

  return [
    val,
    async (upd: SetStateAction<T>) => {
      let newVal = typeof upd === 'function' ? (upd as (p: T) => T)(val) : upd
      if (!newVal) return
      if (persist) localStorage.setItem(key, JSON.stringify(newVal))
      setVal(newVal)
    },
  ]
}
