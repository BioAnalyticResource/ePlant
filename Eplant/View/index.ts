import GeneticElement from '@eplant/GeneticElement'

export type ViewDispatch<A> = (a: A) => void
export type ViewProps<T, A> = {
  activeData: T
  dispatch: ViewDispatch<A>
  geneticElement: GeneticElement | null
}

type ViewAction<T, Action> = {
  render: (props: ViewProps<T, Action>) => JSX.Element
  action: Action
}

// T must be serializable/deserializable with JSON.stringify/JSON.parse
export interface View<T = any, Action = any> {
  // loadEvent should be called to update the view's loading bar.
  // The input is a float between 0 and 1 which represents the fraction of the data
  // that has currently loaded.
  getInitialData?: (
    gene: GeneticElement | null,
    loadEvent: (amount: number) => void
  ) => Promise<T>
  reducer?: (state: T, action: Action) => T
  actions?: ViewAction<T, Action>[]
  // Validate props.activeData with the ZodType
  component: (props: ViewProps<T, Action>) => JSX.Element | null
  icon?: () => JSX.Element
  readonly name: string
  readonly id: string
  citation?: (props: { gene: GeneticElement | null }) => JSX.Element
  header: (props: ViewProps<T, Action>) => JSX.Element
}
