import GeneticElement from '@eplant/GeneticElement'
import { atom, useAtom, WritableAtom } from 'jotai'
import * as React from 'react'
import { View, ViewDispatch } from './index'
import Storage from '@eplant/util/Storage'
import usePromise from '@eplant/util/usePromise'
import { useViewID } from '@eplant/state'

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

const defaultViewData = {
  activeData: undefined,
  loading: false,
  error: null,
  loadingAmount: 0,
}

export type UseViewDataType<T, A> = ViewDataType<T> & {
  dispatch: ViewDispatch<A>
}

// Initial view data is stored on disk to improve load times
const initialViewAtoms: {
  [key: string]: WritableAtom<
    ViewDataType<unknown>,
    React.SetStateAction<ViewDataType<unknown>>,
    void
  >
} = {}

function getViewAtom(key: string, persist: boolean) {
  if (initialViewAtoms[key]) return initialViewAtoms[key]
  const a = atom<ViewDataType<unknown>>({
    ...defaultViewData,
    loading: true,
  })
  if (persist) {
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
  }
  initialViewAtoms[key] = a
  return initialViewAtoms[key]
}

export function useViewData<T, A>(
  view: View<T, A>,
  gene: GeneticElement | null
): UseViewDataType<T, A> {
  const key = `${view.id}-${gene?.id ?? 'generic-view'}`
  const id = key + '-' + useViewID()
  const [initialViewData, setInitialViewData] = useAtom(getViewAtom(key, true))
  const [viewData, setViewData] = useAtom(getViewAtom(id, false))

  // When the initialViewData is loaded from cache, set the viewData
  // if there is no cached initialViewData then load it using the view's loader
  React.useEffect(() => {
    // Don't load data if the view data and they key aren't synced
    if (!initialViewData.loading && !initialViewData.error) {
      const loader = gene?.species.api.loaders[view.id] ?? view.getInitialData
      ;(async () => {
        // Guaranteed to work even though types are broken because if gene is null then view.getInitialData (which accepts null) is always used
        try {
          // If there already is data then don't load it again
          if (initialViewData.activeData) return
          if (!loader) {
            throw ViewDataError.UNSUPPORTED_GENE
          }
          setInitialViewData({
            ...defaultViewData,
            loading: true,
          })
          const data = await loader(gene as GeneticElement, (amount) => {
            setInitialViewData((data) => ({
              ...data,
              loadingAmount: Math.max(amount, data.loadingAmount),
            }))
          })
          const newData = {
            ...defaultViewData,
            activeData: data,
            loading: false,
          }
          setInitialViewData(newData)
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
          setInitialViewData(newData)
        }
      })()
    }
  }, [initialViewData, id])

  React.useEffect(() => {
    if (initialViewData.activeData && !viewData.activeData) {
      setViewData(initialViewData as ViewDataType<T>)
    }
  }, [initialViewData, viewData])

  const dispatch = React.useMemo(
    () => (action: A) => {
      setViewData((viewData) => ({
        ...viewData,
        activeData:
          view.reducer && viewData.activeData
            ? view.reducer(viewData.activeData as T, action)
            : viewData.activeData,
      }))
    },
    [setViewData, view.id, id]
  )

  // Reset viewData when the key changes
  if (viewData.loading || initialViewData.loading) {
    return {
      ...(initialViewData as ViewDataType<T>),
      dispatch,
    }
  }
  return {
    ...(viewData as ViewDataType<T>),
    dispatch,
  }
}
