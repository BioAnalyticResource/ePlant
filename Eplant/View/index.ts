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

export interface View<Data = any, State = any, Action = any> {
  /**
   * Get the initial state of this view.
   * When `getInitialState` is undefined the state defaults to `null`
   */
  getInitialState?: () => State
  // loadEvent should be called to update the view's loading bar.
  // The input is a float between 0 and 1 which represents the fraction of the data
  // that has currently loaded.
  /**
   * Fetch the data for this view for a given gene, and give loading feedback
   */
  getInitialData: (
    gene: GeneticElement | null,
    loadEvent: (amount: number) => void,
  ) => Promise<Data>
  /**
   * A reducer method that is used for the view actions menu,
   * and the `dispatch` in {@link ViewProps['dispatch']}
   */
  reducer?: (state: State, action: Action) => State
  /**
   * The list of actions shown in the view options menu
   */
  actions?: ViewAction<State, Action>[]
  /**
   * The react component that renders this view
   */
  component: (props: ViewProps<Data, State, Action>) => JSX.Element | null
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
  citation?: (props: { gene: GeneticElement | null }) => JSX.Element
  /**
   * Return the title of this view's tab
   */
  header: (props: ViewProps<Data, State, Action>) => JSX.Element
}
