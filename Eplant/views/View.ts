import GeneticElement from '@eplant/GeneticElement'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import * as React from 'react'

export type ViewProps<T> = {
  activeData: T
  geneticElement: GeneticElement | null
}

type ViewAction<T, Action> = {
  label: string
  type: 'toggle' | 'button'
  action: Action
}

// T must be serializable/deserializable with JSON.stringify/JSON.parse
export type View<T = any, Action = any> = {
  // loadEvent should be called to update the view's loading bar.
  // The input is a float between 0 and 1 which represents the fraction of the data
  // that has currently loaded.
  getInitialData?: (
    gene: GeneticElement | null,
    loadEvent: (amount: number) => void
  ) => Promise<any>
  reducer?: (state: T, action: Action) => T
  actions?: ViewAction<T, Action>[]
  // Validate props.activeData with the ZodType
  component: (props: ViewProps<T>) => JSX.Element | null
  icon?: () => JSX.Element
  readonly name: string
  readonly id: string
  citation?: (props: {gene: GeneticElement|null}) => JSX.Element
}

export enum ViewDataError {
  UNSUPPORTED_GENE = 'Unsupported gene',
  FAILED_TO_LOAD = 'Failed to load',
}

type ViewDataType = {
  activeData: any
  loading: boolean
  error: ViewDataError | null
  loadingAmount: number
}
const viewData: { [key: string]: ReturnType<typeof atomWithStorage<ViewDataType>> } = {}

const viewDataStorage = {
  getItem(key: string) {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) {
      throw new Error('no value stored')
    }
    return JSON.parse(storedValue)
  },
  setItem(key: string, value: ViewDataType) {
    if (value.loading) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
  },
}

const getViewDataAtom = (view: View<any>, gene: GeneticElement | null) => {
  const key = `${view.id}-${gene?.id ?? 'generic-view'}`
  if (!viewData[key])
    viewData[key] = atomWithStorage<ViewDataType>(
      'view-data-' + key,
      {
        activeData: undefined,
        loading: false,
        error: null,
        loadingAmount: 0,
      },
      viewDataStorage
    )
  return viewData[key] as typeof viewData[string]
}

export const useViewData = (view: View, gene: GeneticElement | null) => {
  const [viewData, setViewData] = useAtom(getViewDataAtom(view, gene))

  React.useEffect(() => {
    ;(async () => {
      if (viewData.loading || viewData.activeData) return
      setViewData((viewData) => ({ ...viewData, loading: true }))
      try {
        const loader =  gene?.species.api.loaders[view.id] ?? view.getInitialData
        if (!loader) {
          throw ViewDataError.UNSUPPORTED_GENE
        }
        const data = await loader(gene, (amount) => {
          setViewData((viewData) => ({ ...viewData, loadingAmount: amount }))
      })
        setViewData((viewData) => ({ ...viewData, activeData: data }))
      } catch (e) {
        if (e instanceof Error) {
          setViewData((viewData) => ({ ...viewData, error: ViewDataError.FAILED_TO_LOAD }))
        }
        else {
          setViewData((viewData) => ({ ...viewData, error: e as ViewDataError }))
        }
      }
      setViewData((viewData) => ({ ...viewData, loading: false }))
    })()
  }, [view, gene])

  return viewData
}