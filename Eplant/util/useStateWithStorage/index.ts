import { usePersist } from '@eplant/state'
import { SetStateAction, useState, useEffect } from 'react'

/**
 * A a hook like `useState` that stores the state in local storage.
 * @param key The key to store the state in localStorage
 * @param initial The initial state
 * @returns [state, setState] where state is the current state and setState is a function to set the state
 */
export default function useStateWithStorage<T>(
  key: string,
  initial: T,
  serialize: (val: T) => string = JSON.stringify,
  deserialize: (val: string) => T = JSON.parse
): [T, (a: SetStateAction<T>) => void] {
  const persist = usePersist()[0]
  const stored = localStorage.getItem(key)
  const [val, setVal] = useState<T>(stored ? deserialize(stored) : initial)

  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === key) {
        if (persist)
          setVal(event.newValue ? deserialize(event.newValue) : initial)
      }
    }
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }, [key])

  return [
    val,
    async (upd: SetStateAction<T>) => {
      const newVal = typeof upd === 'function' ? (upd as (p: T) => T)(val) : upd
      if (!newVal) return
      if (persist) localStorage.setItem(key, serialize(newVal))
      setVal(newVal)
    },
  ]
}
