import GeneticElement, {
  SerializedGeneticElement,
} from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import arabidopsis from '@eplant/Species/arabidopsis'
import GetStartedView from '@eplant/views/GetStartedView'
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

// Views that aren't associated with genes
const genericViews = [GetStartedView] as const
export const genericViewsAtom = atom(genericViews)
export const useGenericViews = () => useAtomValue(genericViewsAtom)

// All open views, and genes if they are associated
export const viewsAtom = atomWithStorage<{
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
export const useViews = () => useAtom(viewsAtom)
export const useSetViews = () => useSetAtom(viewsAtom)

export const ViewIDContext = React.createContext<string>('')
export const useViewID = () => React.useContext(ViewIDContext)
