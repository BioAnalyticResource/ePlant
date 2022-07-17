import { type Dispatch, type SetStateAction, useState } from 'react'

export default function useStateWithStorage<T>(key: string, initial: T): [T, (a: SetStateAction<T>) => void] {
  const [val, setVal] = useState<T>(
    JSON.parse(localStorage.getItem(key) ?? 'null') ?? initial
  )

  return [
    val,
    async (upd: SetStateAction<T>) => {
      let newVal = typeof upd === 'function' ? (upd as (p: T) => T)(val) : upd
      if (!newVal) return
      localStorage.setItem(key, JSON.stringify(newVal))
      setVal(newVal)
    },
  ]
}
