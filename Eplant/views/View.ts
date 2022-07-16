import GeneticElement from '@eplant/GeneticElement'
import { IconProps } from '@mui/material'
import { atom, Atom, useAtom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'

import * as React from 'react'

export type ViewProps<T> = {
  activeData: T
  geneticElement: GeneticElement | null
}

// T must be serializable/deserializable with JSON.stringify/JSON.parse
export type View<T = any> = {
  // loadEvent should be called to update the view's loading bar.
  // The input is a float between 0 and 1 which represents the fraction of the data
  // that has currently loaded.
  loadData: (
    gene: GeneticElement | null,
    loadEvent: (amount: number ) => void
  ) => Promise<any>
  // Validate props.activeData with the ZodType
  component: (props: ViewProps<T>) => JSX.Element | null
  icon?: () => JSX.Element
  readonly name: string
  readonly id: string
}

export enum ViewDataError {
  UNSUPPORTED_GENE = 'Unsupported gene',
  FAILED_TO_LOAD = 'Failed to load',
  NO_GENE_PROVIDED = 'No gene provided',
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
  return viewData[key]
}

export const useViewData = (view: View, gene: GeneticElement | null) => {
  const [viewData, setViewData] = useAtom(getViewDataAtom(view, gene))

  React.useEffect(() => {
    ;(async () => {
      if (viewData.loading || viewData.activeData) return
      setViewData((viewData) => ({ ...viewData, loading: true }))
      try {
        const data = await view.loadData(gene, (amount) => {
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

export class NoViewError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NoViewError'
  }
}