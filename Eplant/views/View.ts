import GeneticElement from '@eplant/GeneticElement'
import * as React from 'react'

export type ViewProps<Data> = {
  activeData: Data
}

export type View<Data> = {
  loadData: () => Promise<Data>
  component: (props: ViewProps<Data>) => JSX.Element
  readonly name: string
}
