import GeneticElement from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import arabidopsis from '@eplant/Species/arabidopsis'
import { atom, useAtom, useSetAtom } from 'jotai'
import * as React from 'react'

export const speciesAtom = atom<Species[]>([arabidopsis])
export const genesAtom = atom<GeneticElement[]>([])
export const useGeneticElements = () => useAtom(genesAtom)
export const useSpecies = () => useAtom(speciesAtom)
export const useSetGeneticElements = () => useSetAtom(genesAtom)
export const useSetSpecies = () => useSetAtom(speciesAtom)
