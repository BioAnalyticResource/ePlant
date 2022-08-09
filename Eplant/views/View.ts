import GeneticElement from '@eplant/GeneticElement'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import * as React from 'react'

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
  citation?: (props: {gene: GeneticElement|null}) => JSX.Element
  header: (props: ViewProps<T, Action>) => JSX.Element
}

export enum ViewDataError {
  UNSUPPORTED_GENE = 'Unsupported gene',
  FAILED_TO_LOAD = 'Failed to load',
}

type ViewDataType<T> = {
  activeData: T | undefined
  loading: boolean
  error: ViewDataError | null
  loadingAmount: number
}
const viewData: { [key: string]: ReturnType<typeof atomWithStorage<ViewDataType<any>>> } = {}

const viewDataStorage = {
  getItem(key: string) {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) {
      throw new Error('no value stored')
    }
    const val = JSON.parse(storedValue)
    if (val.loading || val.error || !val.activeData) throw new Error('invalid value')
    return val
  },
  setItem(key: string, value: ViewDataType<any>) {
    if (value.loading) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
  },
  subscribe(key: string, change: (value: ViewDataType<any>) => void) {
    const callback = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        change(JSON.parse(event.newValue))
      }
      else if (event.key == key) {
        change({
          activeData: undefined,
          loading: false,
          error: null,
          loadingAmount: 0,
        })
      }
    }
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
  }
}

function getViewDataAtom<T, A>(view: View<T, A>, gene: GeneticElement | null): ReturnType<typeof atomWithStorage<ViewDataType<T>>> {
  const key = `${view.id}-${gene?.id ?? 'generic-view'}`
  if (!viewData[key])
    viewData[key] = atomWithStorage<ViewDataType<T>>(
      'view-data-' + key,
      {
        activeData: undefined,
        loading: false,
        error: null,
        loadingAmount: 0,
      },
      viewDataStorage
    )
  return viewData[key]
}

export function useViewData<T, Action>(view: View<T, Action>, gene: GeneticElement | null) {
  const [initialViewData, setInitialViewData] = useAtom(getViewDataAtom<T, Action>(view, gene))
  // viewData can be incorrect if the inputs to useViewData change because it waits for the effect that syncs them to complete
  // We sync them here to prevent this from happening
  const [prevKey, setPrevKey] = React.useState('')
  const key = `${view.id}-${gene?.id ?? 'generic-view'}`
  const [viewData, setViewData] = React.useState<T | undefined>(initialViewData.activeData)

  React.useEffect(() => {
    ;(async () => {
      if (initialViewData.loading || initialViewData.activeData || initialViewData.error) return
      setInitialViewData((viewData) => ({ ...viewData, loading: true, loadingAmount: 0 }))
      try {
        const loader = gene?.species.api.loaders[view.id] ?? view.getInitialData
        if (!loader) {
          throw ViewDataError.UNSUPPORTED_GENE
        }
        // Guaranteed to work even though types are broken because if gene is null then view.getInitialData is always used
        const data = await loader(gene as GeneticElement, (amount) => {
          setInitialViewData((viewData) => ({ ...viewData, loadingAmount: Math.max(amount, viewData.loadingAmount) }))
        })
        console.log('done')
        setInitialViewData((viewData) => ({ ...viewData, activeData: data }))
      } catch (e) {
        if (e instanceof Error) {
          console.log(e)
          setInitialViewData((viewData) => ({ ...viewData, error: ViewDataError.FAILED_TO_LOAD }))
        }
        else {
          setInitialViewData((viewData) => ({ ...viewData, error: e as ViewDataError }))
        }
      }
      setInitialViewData((viewData) => ({ ...viewData, loading: false }))
    })()
  }, [view.id, gene?.id, initialViewData.loading, initialViewData.error, !!initialViewData.activeData, setInitialViewData])

  React.useEffect(() => {
    if (initialViewData.activeData) {
      setViewData(initialViewData.activeData)
      setPrevKey(key)
    }
  }, [initialViewData.activeData, key])

  const dispatch = React.useMemo(() => (action: Action | ((a: T) => Action)) => {
    setViewData((viewData) => ( 
      viewData ? (view.reducer ? 
        view.reducer(viewData, typeof action == 'function' ? 
          (action as any)(viewData) : action) : 
          viewData) : viewData))
  }, [setViewData, view.id, key])

  return {
    ...initialViewData,
    activeData: key == prevKey ? viewData : initialViewData.activeData,
    dispatch
  }
}