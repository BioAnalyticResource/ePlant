import GeneticElement from '@eplant/GeneticElement'
import * as React from 'react'
import { z } from 'zod'

export type ViewProps<T> = {
  activeData: T
  geneticElement: GeneticElement
}

export type View<T> = {
  // loadEvent should be called to update the view's loading bar.
  // The input is a float between 0 and 1 which represents the fraction of the data
  // that has currently loaded
  dataType: z.ZodType
  loadData: (
    gene: GeneticElement,
    loadEvent: (amount: number) => void
  ) => Promise<any>
  // Validate props.activeData with the ZodType
  component: (props: ViewProps<T>) => JSX.Element
  readonly name: string
}
