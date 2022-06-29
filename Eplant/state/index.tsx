import GeneticElement from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import arabidopsis from '@eplant/Species/arabidopsis'
import GetStartedView from '@eplant/views/GetStartedView'
import { View } from '@eplant/views/View'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import * as React from 'react'

export const genesAtom = atom<GeneticElement[]>([])
export const useGeneticElements = () => useAtom(genesAtom)
export const useSetGeneticElements = () => useSetAtom(genesAtom)

export const speciesAtom = atom<Species[]>([arabidopsis])
export const useSpecies = () => useAtom(speciesAtom)
export const useSetSpecies = () => useSetAtom(speciesAtom)

// Views that aren't associated with genes
const freeViews = [GetStartedView] as const
export const freeViewsAtom = atom(freeViews)
export const userFreeViews = () => useAtomValue(freeViewsAtom)

// All open views, and genes if they are associated
export const viewsAtom = atom<{
  [key: string]: {
    view: View[]
    activeGene: GeneticElement | null
  }
}>({})
export const useViews = () => useAtom(viewsAtom)
export const useSetViews = () => useSetAtom(viewsAtom)
