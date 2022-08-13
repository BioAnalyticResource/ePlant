import GeneticElement from '@eplant/GeneticElement'
import { atom, useAtom, useAtomValue, WritableAtom } from 'jotai'
import * as React from 'react'
import { View, ViewDispatch } from './index'
import Storage from '@eplant/util/Storage'
import usePromise from '@eplant/util/usePromise'
import { atomWithStorage, useViewID } from '@eplant/state'

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

export const viewDataStorage = new Storage<string, ViewDataType<unknown>>(
  'view-data'
)
export const viewStateStorage = new Storage<string, unknown>('view-state')

const defaultViewData = {
  activeData: undefined,
  loading: false,
  error: null,
  loadingAmount: 0,
}

export type UseViewDataType<T, S, A> = ViewDataType<T> & {
  dispatch: ViewDispatch<A>
  state?: S
}

// Initial view data is stored on disk to improve load times
const viewDataAtoms: {
  [key: string]: WritableAtom<
    ViewDataType<unknown>,
    React.SetStateAction<ViewDataType<unknown>>,
    void
  >
} = {}

const viewStateAtoms: {
  [key: string]: WritableAtom<unknown, React.SetStateAction<unknown>, void>
} = {}

function getViewAtom(key: string) {
  if (viewDataAtoms[key]) return viewDataAtoms[key]
  const a = atom<ViewDataType<unknown>>({
    ...defaultViewData,
    loading: true,
  })
  // Check if there is cached data on mount
  a.onMount = (setAtom) => {
    viewDataStorage.get(key).then((v) => {
      if (v) setAtom(v)
      else setAtom(defaultViewData)
    })
    const listener = (e: ViewDataType<unknown> | undefined) => {
      if (e) setAtom(e)
      else setAtom(defaultViewData)
    }
    return viewDataStorage.watch(key, listener)
  }
  viewDataAtoms[key] = a
  return viewDataAtoms[key]
}

function getViewStateAtom(key: string) {
  if (viewStateAtoms[key]) return viewStateAtoms[key]
  viewStateAtoms[key] = atomWithStorage(viewStateStorage, key, undefined)
  return viewStateAtoms[key]
}

export function useViewData<T, S, A>(
  view: View<T, S, A>,
  gene: GeneticElement | null
): UseViewDataType<T, S, A> {
  const key = `${view.id}-${gene?.id ?? 'generic-view'}`
  const id = (view?.id ?? 'generic-view') + '-' + useViewID()
  const [viewData, setViewData] = useAtom(getViewAtom(key))
  const [viewState, setViewState] = useAtom(getViewStateAtom(id))

  // If there is no cached viewData then load it using the view's loader
  React.useEffect(() => {
    // Don't load data if the view data and they key aren't synced
    if (!viewData.loading && !viewData.error) {
      const loader = gene?.species.api.loaders[view.id] ?? view.getInitialData
      ;(async () => {
        // Guaranteed to work even though types are broken because if gene is null then view.getInitialData (which accepts null) is always used
        try {
          // If there already is data then don't load it again
          if (viewData.activeData !== undefined) return
          if (!loader) {
            throw ViewDataError.UNSUPPORTED_GENE
          }
          setViewData({
            ...defaultViewData,
            loading: true,
          })
          const data = await loader(gene as GeneticElement, (amount) => {
            setViewData((data) => {
              return {
                ...data,
                loadingAmount: Math.max(amount, data.loadingAmount),
              }
            })
          })
          const newData = {
            ...defaultViewData,
            activeData: data,
            loading: false,
          }
          setViewData(newData)
          viewDataStorage.set(key, newData)
        } catch (e) {
          const newData = {
            ...defaultViewData,
            error:
              e instanceof Error
                ? ViewDataError.FAILED_TO_LOAD
                : (e as ViewDataError),
            loading: false,
          }
          setViewData(newData)
        }
      })()
    }
  }, [viewData, id, gene?.id, view.id])

  React.useEffect(() => {
    if (viewState === undefined && viewData.activeData !== undefined) {
      setViewState(
        view.getInitialState
          ? view.getInitialState(viewData.activeData as T)
          : null
      )
    }
  }, [viewState, viewData.activeData, view.getInitialState])

  const dispatch = React.useMemo(
    () => (action: A) => {
      setViewState((viewState: S) =>
        view.reducer && viewState !== undefined
          ? view.reducer(viewState, action)
          : viewState
      )
    },
    [setViewState, view.id, id]
  )

  // Reset viewData when the key changes
  return {
    ...(viewData as ViewDataType<T>),
    dispatch,
    // TODO: Figure out why viewData.activeData sometimes refers to the value from the previous render
    state: viewState as S | undefined /* ?? viewData.activeData !== undefined
        ? view.getInitialState(viewData.activeData)
        : undefined,*/,
  }
}
