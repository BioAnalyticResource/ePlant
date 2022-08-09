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

const viewAtoms: {
  [key: string]: WritableAtom<
    ViewDataType<unknown>,
    React.SetStateAction<ViewDataType<unknown>>,
    void
  >
} = {}

function getViewAtom(key: string) {
  if (viewAtoms[key]) return viewAtoms[key]
  console.log('creating new')
  const a = atom<ViewDataType<unknown>>(defaultViewData)
  // Check if there is cached data on mount
  a.onMount = (setAtom) => {
    viewDataStorage.get(key).then((v) => {
      if (v) {
        setAtom(v)
      }
    })
    const listener = (e: ViewDataType<unknown> | undefined) => {
      console.log(key, e)
      if (e) setAtom(e)
      else setAtom(defaultViewData)
    }
    return viewDataStorage.watch(key, listener)
  }
  viewAtoms[key] = a
  return viewAtoms[key]
}

export function useViewData<T, A>(
  view: View<T, A>,
  gene: GeneticElement | null
): UseViewDataType<T, A> {
  const key = `${view.id}-${gene?.id ?? 'generic-view'}`
  const id = key + '-' + useViewID()
  const [initialViewData, setInitialViewData] = useAtom(getViewAtom(key))
  // viewData can be incorrect if the inputs to useViewData change because it waits for the effect that syncs them to complete
  // Storing the previous key allows us to throw an error when this happens
  const [prevID, setPrevID] = React.useState('')
  const [viewData, setViewData] =
    React.useState<ViewDataType<T>>(defaultViewData)

  // Reset viewData when the key changes
  if (prevID != id) {
    setViewData(defaultViewData)
    setPrevID(id)
  }

  // When the initialViewData is loaded from cache, set the viewData
  // if there is no cached initialViewData then load it using the view's loader
  React.useEffect(() => {
    // Don't load data if the view data and they key aren't synced
    if (id != prevID) return
    if (initialViewData && initialViewData.activeData) {
      setViewData(initialViewData as ViewDataType<T>)
    } else if (!initialViewData.loading && !initialViewData.error) {
      const loader = gene?.species.api.loaders[view.id] ?? view.getInitialData
      ;(async () => {
        // Guaranteed to work even though types are broken because if gene is null then view.getInitialData (which accepts null) is always used
        try {
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
  }, [initialViewData, key])

  React.useEffect(() => {
    if (initialViewData.activeData && id == prevID) {
      setViewData(initialViewData as ViewDataType<T>)
    }
  }, [initialViewData, id, prevID])

  const dispatch = React.useMemo(
    () => (action: A) => {
      setViewData((viewData) => ({
        ...viewData,
        activeData:
          view.reducer && viewData.activeData
            ? view.reducer(viewData.activeData, action)
            : viewData.activeData,
      }))
    },
    [setViewData, view.id, id]
  )

  console.log(viewData, initialViewData, id, prevID)
  if (viewData.loading || initialViewData.loading || id != prevID) {
    return {
      ...initialViewData,
      activeData: initialViewData.activeData as T | undefined,
      dispatch,
    }
  }
  return {
    ...viewData,
    dispatch,
  }
}
