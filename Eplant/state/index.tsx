import GeneticElement from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import arabidopsis from '@eplant/Species/arabidopsis'
import { atom, useAtom, useSetAtom } from 'jotai'
import * as React from 'react'

const persistAtom = atom<boolean>(true)
export const useSetPersist = () => useSetAtom(persistAtom)
export const usePersist = () => useAtom(persistAtom)

// Atom with storage that doesn't persist when persistAtom is set to false
function atomWithOptionalStorage<T>(
  key: string,
  initialValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (value: string) => T = JSON.parse
) {
  const val = atom<T>(initialValue)
  val.onMount = (setAtom) => {
    const value = localStorage.getItem(key)
    setAtom(value ? deserialize(value) : initialValue)
    const listener = (e: StorageEvent) => {
      console.log(e)
      if (e.key === key && e.newValue) {
        setAtom(deserialize(e.newValue))
      }
    }
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }
  const a = atom(
    (get) => {
      return get(val)
    },
    (get, set, x: React.SetStateAction<T>) => {
      const newValue = typeof x == 'function' ? (x as any)(get(val)) : x
      if (get(persistAtom)) {
        localStorage.setItem(key, serialize(newValue))
      }
      set(val, newValue)
    }
  )
  return a
}

export const genesAtom = atomWithOptionalStorage<GeneticElement[]>(
  'genes',
  [],
  (genes) => JSON.stringify(genes.map(GeneticElement.serialize)),
  (genes) => JSON.parse(genes).map(GeneticElement.deserialize)
)
export const useGeneticElements = () => useAtom(genesAtom)
export const useSetGeneticElements = () => useSetAtom(genesAtom)

export const speciesAtom = atom<Species[]>([arabidopsis])
export const useSpecies = () => useAtom(speciesAtom)
export const useSetSpecies = () => useSetAtom(speciesAtom)

// All open views, and genes if they are associated
export const panesAtom = atomWithOptionalStorage<{
  [id: string]: {
    view: string
    activeGene: string | null
  }
}>('open-views', {})
export const usePanes = () => useAtom(panesAtom)
export const useSetPanes = () => useSetAtom(panesAtom)

export const ViewIDContext = React.createContext<string>('')
export const useViewID = () => React.useContext(ViewIDContext)

export const printingAtom = atom<string | null>(null)
export const usePrinting = () => useAtom(printingAtom)
export const useSetPrinting = () => useSetAtom(printingAtom)

export const darkModeAtom = atomWithOptionalStorage<boolean>('dark-mode', true)
export const useDarkMode = () => useAtom(darkModeAtom)
export const useSetDarkMode = () => useSetAtom(darkModeAtom)
