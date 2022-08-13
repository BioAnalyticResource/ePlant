import GeneticElement from '@eplant/GeneticElement'

export type ViewDispatch<Action> = (a: Action) => void
export type ViewProps<Data, State, Action> = {
  activeData: Data
  state: State
  dispatch: ViewDispatch<Action>
  geneticElement: GeneticElement | null
}

type ViewAction<State, Action> = {
  render: (props: {
    state: State
    dispatch: ViewDispatch<Action>
    geneticElement: GeneticElement | null
  }) => JSX.Element
  action: Action
}

// T must be serializable/deserializable with JSON.stringify/JSON.parse
export interface View<Data = any, State = any, Action = any> {
  // loadEvent should be called to update the view's loading bar.
  // The input is a float between 0 and 1 which represents the fraction of the data
  // that has currently loaded.
  getInitialState?: (initialData: Data) => State
  getInitialData?: (
    gene: GeneticElement | null,
    loadEvent: (amount: number) => void
  ) => Promise<Data>
  reducer?: (state: State, action: Action) => State
  actions?: ViewAction<State, Action>[]
  // Validate props.activeData with the ZodType
  component: (props: ViewProps<Data, State, Action>) => JSX.Element | null
  icon?: () => JSX.Element
  readonly name: string
  readonly id: string
  citation?: (props: { gene: GeneticElement | null }) => JSX.Element
  header: (props: ViewProps<Data, State, Action>) => JSX.Element
}
