import GeneticElement from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import * as React from 'react'
import { GenesContext, useGeneticElementsState } from './geneticElements'
import { SpeciesContext, useSpeciesState } from './species'

export default function EplantStateProvider({
  species: speciesInit,
  genes: genesInit,
  ...props
}: React.PropsWithChildren<{
  species?: Species[]
  genes?: GeneticElement[]
}>) {
  const genes = useGeneticElementsState(genesInit)
  const species = useSpeciesState(speciesInit)
  return (
    <GenesContext.Provider value={genes}>
      <SpeciesContext.Provider value={species}>
        {props.children}
      </SpeciesContext.Provider>
    </GenesContext.Provider>
  )
}
