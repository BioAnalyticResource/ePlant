import * as React from 'react'
import GeneticElement from './GeneticElement'
export type EplantProps = {}

export const GenesContext = React.createContext<GeneticElement[]>([])
