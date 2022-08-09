import GeneticElement from '@eplant/GeneticElement'
import { Species } from '@eplant/GeneticElement'
import arabidopsis from '@eplant/Species/arabidopsis'
import Storage from '@eplant/util/Storage'
import { atom, useAtom, useAtomValue, useSetAtom, WritableAtom } from 'jotai'
import * as React from 'react'

const persistAtom = atom<boolean>(true)
export const useSetPersist = () => useSetAtom(persistAtom)
export const usePersist = () => useAtom(persistAtom)

export const storage = new Storage<string, string>('ePlant')

let waitingCount = 0
export const loadingAtom = atom<number>(0)

// Atom with storage that doesn't persist when persistAtom is set to false
function atomWithOptionalStorage<T>(
  key: string,
  initialValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (value: string) => T = JSON.parse
) {
  const val = atom<T>(initialValue)
  waitingCount++
  val.onMount = (setAtom) => {
    const listener = (e: string | undefined) => {
      if (e) setAtom(deserialize(e))
      else setAtom(initialValue)
    }
    ;(async () => {
      const val = await storage.get(key)
      if (val) {
        setAtom(deserialize(val))
      }
    })()
    return storage.watch(key, listener)
  }
  const a = atom(
    (get) => {
      return get(val)
    },
    (get, set, x: React.SetStateAction<T>) => {
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
  atom: WritableAtom<T, React.SetStateAction<T>, void>,
  reducer: (x: T, action: A) => T
): (action: A) => void {
  const setValue = useSetAtom(atom)
  return (action: A) => setValue((value) => reducer(value, action))
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

type Panes = {
  [id: string]: {
    view: string
    activeGene: string | null
    popout: boolean
  }
}

type PanesAction =
  | { type: 'set-view'; id: string; view: string }
  | { type: 'set-active-gene'; id: string; activeGene: string | null }
  | { type: 'make-popout'; id: string }
  | { type: 'close-popout'; id: string }
  | { type: 'new'; id: string; activeGene: string | null }
  | { type: 'close'; id: string }
// All open views, and genes if they are associated
export const panesAtom = atomWithOptionalStorage<Panes>('open-views', {
  default: {
    activeGene: null,
    view: 'get-started',
    popout: false,
  },
})

// TODO: Test this
export const panesReducer: (prev: Panes, action: PanesAction) => Panes = (
  prev: Panes,
  action: PanesAction
) => {
  const def = {
    view: 'get-started',
    activeGene: null,
    popout: false,
  }
  const { [action.id]: _, ...rest } = prev
  switch (action.type) {
    case 'set-view':
      return {
        ...prev,
        [action.id]: {
          ...def,
          ...prev[action.id],
          view: action.view,
        },
      }
    case 'set-active-gene':
      return {
        ...prev,
        [action.id]: {
          ...def,
          ...prev[action.id],
          activeGene: action.activeGene,
        },
      }
    case 'make-popout':
      return {
        ...prev,
        [action.id]: {
          ...def,
          ...prev[action.id],
          popout: true,
        },
      }
    case 'close-popout':
      return {
        ...prev,
        [action.id]: {
          ...def,
          ...prev[action.id],
          popout: false,
        },
      }
    case 'new':
      return {
        ...prev,
        [action.id]: {
          ...def,
          activeGene: action.activeGene,
        },
      }
    case 'close':
      return rest
  }
}

export const usePanes = () =>
  [useAtomValue(panesAtom), useAtomReducer(panesAtom, panesReducer)] as [
    Panes,
    (action: PanesAction) => void
  ]
export const usePanesDispatch = () => useAtomReducer(panesAtom, panesReducer)

export const ViewIDContext = React.createContext<string>('')
export const useViewID = () => React.useContext(ViewIDContext)

export const printingAtom = atom<string | null>(null)
export const usePrinting = () => useAtom(printingAtom)
export const useSetPrinting = () => useSetAtom(printingAtom)

export const darkModeAtom = atomWithOptionalStorage<boolean>('dark-mode', true)
export const useDarkMode = () => useAtom(darkModeAtom)
export const useSetDarkMode = () => useSetAtom(darkModeAtom)

export const activeIdAtom = atomWithOptionalStorage<string>('active-id', '')
export const useActiveId = () => useAtom(activeIdAtom)

export function getPaneName(pane: Panes[string]) {
  return `${pane.activeGene ? pane.activeGene + ' - ' : ''}${pane.view}`
}
