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
import { atomWithStorage } from 'jotai/utils'
import * as React from 'react'

export const baseGenesAtom = atom<GeneticElement[]>([])

baseGenesAtom.onMount = (setAtom) => {
  setAtom(
    (
      JSON.parse(
        localStorage.getItem('geneticElements') || '[]'
      ) as SerializedGeneticElement[]
    ).map(GeneticElement.deserialize)
  )
}

export const genesAtom = atom(
  (get) => get(baseGenesAtom),
  (get, set, newValue: GeneticElement[]) => {
    set(baseGenesAtom, newValue)
    localStorage.setItem(
      'geneticElements',
      JSON.stringify(newValue.map(GeneticElement.serialize))
    )
  }
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
export const panesAtom = atomWithStorage<{
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
