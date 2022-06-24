import Species from '@eplant/Species'
import React from 'react'

export type SpeciesState = [Species[], (ge: Species[]) => void]
export const SpeciesContext = React.createContext<SpeciesState>([[], () => {}])
export const useSpecies = () => React.useContext(SpeciesContext)
export const useSpeciesState = (sp: Species[] = []) =>
  React.useState<Species[]>(sp)
