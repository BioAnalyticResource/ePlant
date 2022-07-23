import GeneticElement, {
  SerializedGeneticElement,
} from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import arabidopsis from '@eplant/Species/arabidopsis'
import FallbackView from '@eplant/views/FallbackView'
import { GeneInfoView as GeneInfoViewer } from '@eplant/views/GeneInfoView'
import GetStartedView from '@eplant/views/GetStartedView'
import { PublicationViewer } from '@eplant/views/PublicationViewer'
import { View } from '@eplant/views/View'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import * as React from 'react'

const persistAtom = atom<boolean>(true)
export const useSetPersist = () => useSetAtom(persistAtom)
export const usePersist = () => useAtom(persistAtom)
// Atom with storage that doesn't persist when persistence is set to false
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
      console.log(e.newValue)
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
    (get, set, x: T) => {
      if (get(persistAtom)) {
        localStorage.setItem(key, serialize(x))
      }
      set(val, x)
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

// Views that aren't associated with individual genes
const genericViews = [GetStartedView, FallbackView] as const
export const genericViewsAtom = atom(genericViews)
export const useGenericViews = () => useAtomValue(genericViewsAtom)

// List of views that a user can select from
// Can contain views from the genericViews list too
const userViews = [GeneInfoViewer, PublicationViewer] as const
export const userViewsAtom = atom(userViews)
export const useUserViews = () => useAtomValue(userViewsAtom)

// List of views that are used to lookup a view by id
// Not guaranteed to be free of duplicate views
const views = [...genericViews, ...userViews] as const
export const viewsAtom = atom(views)
export const useViews = () => useAtomValue(viewsAtom)

// All open views, and genes if they are associated
export const panesAtom = atomWithOptionalStorage<{
  [id: string]: {
    view: string
    activeGene: string | null
  }
}>('open-views', {
  default: {
    view: 'get-started',
    activeGene: null,
  },
})
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
