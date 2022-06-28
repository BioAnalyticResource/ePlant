import GeneticElement from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import arabidopsis from '@eplant/Species/arabidopsis'
import { View } from '@eplant/views/View'
import { atom, useAtom, useSetAtom } from 'jotai'
import * as React from 'react'

export const genesAtom = atom<GeneticElement[]>([])
export const useGeneticElements = () => useAtom(genesAtom)
export const useSetGeneticElements = () => useSetAtom(genesAtom)

export const speciesAtom = atom<Species[]>([arabidopsis])
export const useSpecies = () => useAtom(speciesAtom)
export const useSetSpecies = () => useSetAtom(speciesAtom)

export const viewsAtom = atom<View<any>[]>([])
export const useViews = () => useAtom(viewsAtom)
export const useSetViews = () => useSetAtom(viewsAtom)
