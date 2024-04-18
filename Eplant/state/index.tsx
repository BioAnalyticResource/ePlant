import { createContext, useContext, useEffect, useState } from 'react'
import { atom, SetStateAction, useAtom, useSetAtom, WritableAtom } from 'jotai'

import GeneticElement from '@eplant/GeneticElement'
import { Species } from '@eplant/GeneticElement'
import arabidopsis from '@eplant/Species/arabidopsis'
import Storage from '@eplant/util/Storage'

const persistAtom = atom<boolean>(true)
export const useSetPersist = () => useSetAtom(persistAtom)
export const usePersist = () => useAtom(persistAtom)

export const storage = new Storage<string, string>('ePlant')

export const loadingAtom = atom<number>(0)

export const pageLoad = (() => {
  let waiting = 1
  let finished = 1
  const watchers = new Set<(prog: number) => void>()
  return {
    start() {
      waiting++
      watchers.forEach((w) => w(finished / waiting))
      let done = false
      return () => {
        if (done) return
        done = true
        finished++
        watchers.forEach((w) => w(finished / waiting))
      }
    },
    watch(cb: (progress: number) => void) {
      watchers.add(cb)
      return () => {
        watchers.delete(cb)
      }
    },
  }
})()

export const usePageLoad = () => {
  const [progress, setProgress] = useState(0)
  useEffect(() => pageLoad.watch(setProgress), [])
  return [progress, progress == 1] as [number, boolean]
}

export function atomWithStorage<T>(
  storage: Storage<string, T>,
  key: string,
  initialValue: T,
  loading?: () => () => void
) {
  const val = atom<T>(initialValue)
  const loadedValue = storage.get(key)
  val.onMount = (setAtom) => {
    const listener = (e: T | undefined) => {
      if (e) setAtom(e)
      else setAtom(initialValue)
    }
    ;(async () => {
      const finished = loading?.()
      try {
        const val = await loadedValue
        if (val) {
          setAtom(val)
        }
      } finally {
        if (finished) finished()
      }
    })()
    return storage.watch(key, listener)
  }
  const a = atom(
    (get) => {
      //throw loadedValue
      return get(val)
    },
    (get, set, x: SetStateAction<T>) => {
      const newValue =
        typeof x == 'function' ? (x as (prev: T) => T)(get(val)) : x
      if (get(persistAtom)) {
        storage.set(key, newValue)
      }
      set(val, newValue)
    }
  )
  return a
}

export function atomWithUrlStorage<T>(
  key: string,
  initialValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (value: string) => T = JSON.parse
) {
  const parse = () => {
    const url = new URL(window.location.href)
    const value = url.searchParams.get(key)
    if (value === null) return initialValue
    return deserialize(value)
  }
  const val = atom<T>(parse())
  val.onMount = (setAtom) => {
    const listener = () => {
      setAtom(parse())
    }
    window.addEventListener('locationchange', listener)
    return () => {
      window.removeEventListener('locationchange', listener)
    }
  }
  const a = atom(
    (get) => {
      return get(val)
    },
    (get, set, x: SetStateAction<T>) => {
      const newValue =
        typeof x == 'function' ? (x as (prev: T) => T)(get(val)) : x
      const url = new URL(window.location.href)
      url.searchParams.set(key, serialize(newValue))
      window.history.pushState({}, '', url.toString())
      set(val, newValue)
    }
  )
  return a
}

// TODO: This should probably be removed
// Atom with storage that doesn't persist when persistAtom is set to false
function atomWithOptionalStorage<T>(
  key: string,
  initialValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (value: string) => T = JSON.parse
) {
  const val = atom<T>(initialValue)
  const loadedValue = storage.get(key)
  val.onMount = (setAtom) => {
    const listener = (e: string | undefined) => {
      if (e) setAtom(deserialize(e))
      else setAtom(initialValue)
    }
    ;(async () => {
      const done = pageLoad.start()
      try {
        const val = await loadedValue
        if (val) {
          setAtom(deserialize(val))
        }
      } finally {
        done()
      }
    })()
    return storage.watch(key, listener)
  }
  const a = atom(
    (get) => {
      return get(val)
    },
    (get, set, x: SetStateAction<T>) => {
      const newValue =
        typeof x == 'function' ? (x as (prev: T) => T)(get(val)) : x
      if (get(persistAtom)) {
        storage.set(key, serialize(newValue))
      }
      set(val, newValue)
    }
  )
  return a
}

function useAtomReducer<T, A>(
  atom: WritableAtom<T, [SetStateAction<T>], void>,
  reducer: (x: T, action: A) => T
): (action: A) => void {
  const setValue = useSetAtom(atom)
  return (action: A) => setValue((value) => reducer(value, action))
}

export const genesAtom = atom<GeneticElement[]>(
  []
) /*atomWithUrlStorage<GeneticElement[]>(
  'genes',
  [],
  (genes) => JSON.stringify(genes.map(GeneticElement.serialize)),
  (genes) => JSON.parse(genes).map(GeneticElement.deserialize)
)*/
export const useGeneticElements = () => useAtom(genesAtom)
export const useSetGeneticElements = () => useSetAtom(genesAtom)

const fetchCitations = () => {
  return fetch('https://bar.utoronto.ca/eplant/data/citations.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .catch((error) => {
      console.error('Error fetching citations:', error)
      throw error
    })
}
export const citationsAtom = atom(await fetchCitations())
export const useCitations = () => useAtom(citationsAtom)

export const collectionsAtom = atomWithOptionalStorage<
  { genes: string[]; name: string; open: boolean }[]
>(
  'collections',
  [
    {
      genes: [],
      name: 'Collection 1',
      open: true,
    },
  ],
  (collections) => JSON.stringify(collections),
  (collections) => JSON.parse(collections)
)

export const useCollections = () => useAtom(collectionsAtom)
export const useSetCollections = () => useSetAtom(collectionsAtom)

const speciesAtom = atom<Species[]>([arabidopsis])
export const useSpecies = () => useAtom(speciesAtom)
export const useSetSpecies = () => useSetAtom(speciesAtom)

const printingAtom = atom<boolean>(false)
export const usePrinting = () => useAtom(printingAtom)
export const useSetPrinting = () => useSetAtom(printingAtom)

const darkModeAtom = atomWithOptionalStorage<boolean>('dark-mode', true)
export const useDarkMode = () => useAtom(darkModeAtom)
export const useSetDarkMode = () => useSetAtom(darkModeAtom)

export const activeIdAtom = atomWithOptionalStorage<string>('active-id', '')
export const useActiveId = () => useAtom(activeIdAtom)
export const setActiveId = () => useSetAtom(activeIdAtom)

export const sidebarAtom = atom<boolean>(false)
export const useSidebarState = () => useAtom(sidebarAtom)
export const useSetSidebarState = () => useSetAtom(sidebarAtom)
