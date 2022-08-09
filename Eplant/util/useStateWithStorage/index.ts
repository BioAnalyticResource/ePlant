import { storage, usePersist } from '@eplant/state'
import React, { SetStateAction, useState, useEffect } from 'react'

/**
 * A a hook like `useState` that stores the state in local storage.
 *
 * Note: if you change `key`, there will be a render where the state is not updated.
 * @param key The key used to store the state in storage
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
  const [val, setVal] = useState<T>(initial)

  React.useEffect(() => {
    storage.get(key).then((x) => {
      console.log(x)
      if (x) setVal(deserialize(x))
    })
    const listener = (x: string | undefined) => {
      if (x) setVal(deserialize(x))
    }
    return storage.watch(key, listener)
  }, [key])

  useEffect(() => {}, [key])

  return [
    val,
    async (upd: SetStateAction<T>) => {
      const newVal = typeof upd === 'function' ? (upd as (p: T) => T)(val) : upd
      if (!newVal) return
      if (persist) storage.set(key, serialize(newVal))
      setVal(newVal)
    },
  ]
}
