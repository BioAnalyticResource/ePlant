import GeneticElement from '@eplant/GeneticElement'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import * as React from 'react'

export type ViewProps<T, A> = {
  activeData: T
  dispatch: (a: A | ((a: T) => A)) => void
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
    return JSON.parse(storedValue)
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
      console.log(event)
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
  const [viewData, setViewData] = useAtom(getViewDataAtom<T, Action>(view, gene))

  React.useEffect(() => {
    ;(async () => {
      if (viewData.loading || viewData.activeData) return
      setViewData((viewData) => ({ ...viewData, loading: true }))
      try {
        const loader = gene?.species.api.loaders[view.id] ?? view.getInitialData
        if (!loader) {
          throw ViewDataError.UNSUPPORTED_GENE
        }
        // Guaranteed to work even though types are broken because if gene is null then view.getInitialData is always used
        const data = await loader(gene as GeneticElement, (amount) => {
          setViewData((viewData) => ({ ...viewData, loadingAmount: amount }))
      })
        setViewData((viewData) => ({ ...viewData, activeData: data }))
      } catch (e) {
        if (e instanceof Error) {
          console.log(e)
          setViewData((viewData) => ({ ...viewData, error: ViewDataError.FAILED_TO_LOAD }))
        }
        else {
          setViewData((viewData) => ({ ...viewData, error: e as ViewDataError }))
        }
      }
      setViewData((viewData) => ({ ...viewData, loading: false }))
    })()
  }, [view, gene, viewData])

  const dispatch = React.useMemo(() => (action: Action | ((a: T) => Action)) => {
    setViewData((viewData) => ({ 
      ...viewData, 
      activeData: viewData.activeData ? (view.reducer ? 
        view.reducer(viewData.activeData, typeof action == 'function' ? 
          (action as any)(viewData.activeData) : action) : 
          viewData.activeData) : viewData.activeData}))
  }, [setViewData, view.id])

  return {
    ...viewData, 
    dispatch
  }
}