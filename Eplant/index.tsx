import * as React from 'react'
import {
  GenesContext,
  useGeneticElementsState,
} from './contexts/geneticElements'

export type EplantProps = {}

export default function Eplant() {
  const genes = useGeneticElementsState()
  return <GenesContext.Provider value={genes}></GenesContext.Provider>
}
