import GeneticElement from '@eplant/GeneticElement'
import React from 'react'

export type GeneticElementsState = [
  GeneticElement[],
  (ge: GeneticElement[]) => void
]
export const GenesContext = React.createContext<GeneticElementsState>([
  [],
  () => {},
])
export function useGeneticElements() {
  return React.useContext(GenesContext)
}
export const useGeneticElementsState = (ge: GeneticElement[] = []) =>
  React.useState<GeneticElement[]>(ge)
