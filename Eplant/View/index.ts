import GeneticElement from '@eplant/GeneticElement'

export type StateAction<T> = {
  name: string
  description: string
  mutation: (prevState: T, ...args: any[]) => T
  icon: JSX.Element
}

export enum ViewDataError {
  UNSUPPORTED_GENE = 'Unsupported gene',
  FAILED_TO_LOAD = 'Failed to load',
}

export interface ViewMetadata<Data = any, State = any> {
  /**
   * A react component returning icon that represents this view.
   * Used in the gene info viewer
   */
  icon?: () => JSX.Element
  readonly name: string
  readonly id: string
  description?: string
  thumbnail?: string
  /**
   * The react component that renders citations for a gene
   */
  citation?: (props: {
    state?: State
    activeData?: Data
    gene?: GeneticElement | null
  }) => JSX.Element
  /**
   * The list of view actions that can be performed on this view
   */
  actions?: StateAction<State>[]
}
