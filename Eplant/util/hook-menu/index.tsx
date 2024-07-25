import {
  Context,
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useId,
  useReducer,
} from 'react'

type Entries<Entry> = {
  idOrdering: string[]
  entries: {
    [id: string]: Entry
  }
}
type HookMenuAction<Entry> =
  | { type: 'add'; entry: Entry; id: string }
  | { type: 'remove'; id: string }

type HookMenuContextValue<Entry> = [
  Entries<Entry>,
  Dispatch<HookMenuAction<Entry>>,
]
/**
 * Generates a list of entries by calling a hook in order.
 * Used to generate action menus for views that render somewhere else,
 * while allowing the user to put callbacks in the view's render method.
 */
export default class HookMenu<EntryType> {
  private context: Context<HookMenuContextValue<EntryType>>
  constructor() {
    this.context = createContext<HookMenuContextValue<EntryType>>([
      { idOrdering: [], entries: {} },
      (a) => a,
    ])
  }
  /**
   * Generates a context provider for the HookMenu. All components that use entries must be within this root.
   * @param props - Props containing the children of this hook menu
   * @returns
   */
  Root(props: PropsWithChildren) {
    const [value, dispatch] = useReducer<typeof this.reducer>(this.reducer, {
      idOrdering: [],
      entries: {},
    })
    return (
      <this.context.Provider value={[value, dispatch]}>
        {props.children}
      </this.context.Provider>
    )
  }

  /**
   * @returns The entries in the HookMenu
   */
  useEntries() {
    const val = useContext(this.context)[0]
    return val.idOrdering
      .map((id) => val.entries[id])
      .filter((x) => x) as EntryType[]
  }

  /**
   * @param entry - The entry to add to the HookMenu
   */
  useEntry(entry: EntryType) {
    const [, dispatch] = useContext(this.context)
    const id = useId()
    useEffect(() => {
      dispatch({ type: 'add', entry, id })
      return () => dispatch({ type: 'remove', id })
    }, [entry, id])
  }

  private reducer(
    state: Entries<EntryType>,
    action: HookMenuAction<EntryType>
  ) {
    const { [action.id]: old, ...rest } = state.entries
    switch (action.type) {
      case 'add':
        return {
          idOrdering: state.idOrdering.includes(action.id)
            ? state.idOrdering
            : [...state.idOrdering, action.id],
          entries: { ...state.entries, [action.id]: action.entry },
        }
      case 'remove':
        return {
          idOrdering: state.idOrdering,
          entries: rest,
        }
      default:
        return state
    }
  }
}
