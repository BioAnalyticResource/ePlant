import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { useOutletContext, useSearchParams } from 'react-router-dom'

import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { flattenState } from '@eplant/util/router'
import { useQuery } from '@tanstack/react-query'

import { EFPViewerActions } from '../eFP/Viewer/actions'
import {
  EFPViewer,
  EFPViewerLoader,
  ValidateEFPViewerParams,
} from '../eFP/Viewer/EFPViewer'
import { EFPViewerData, EFPViewerState } from '../eFP/Viewer/types'

import { experimentEFPs, experimentEFPViews } from './efps'

export const ExperimentEFP = () => {
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()

  const [searchParams, setSearchParams] = useSearchParams()
  const [viewState, setViewState] = useState<EFPViewerState>({
    activeView: '',
    colorMode: 'absolute',
    transform: {
      offset: {
        x: 0,
        y: 0,
      },
      zoom: 1,
    },
    sortBy: 'name',
    maskingEnabled: false,
    maskThreshold: 100,
  })
  const { data, isLoading, isError, error } = useQuery<EFPViewerData>({
    queryKey: [`tissue-${geneticElement?.id}`],
    queryFn: async () => {
      if (!geneticElement) {
        throw Error('No gene')
      }
      const data = EFPViewerLoader(
        geneticElement,
        experimentEFPs,
        experimentEFPViews,
        setLoadAmount
      )
      return data
    },
    enabled: !!geneticElement,
  })

  useEffect(() => {
    setViewState(ValidateEFPViewerParams(searchParams, experimentEFPs))
  }, [])

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading])

  const debouncedUpdateSearchParams = useCallback(
    debounce((updatedState) => {
      setSearchParams(new URLSearchParams(flattenState(updatedState)))
    }, 200), // 200ms delay before updating the URL
    [setSearchParams]
  )

  useEffect(() => {
    debouncedUpdateSearchParams(viewState)
    return () => {
      debouncedUpdateSearchParams.cancel()
    }
  }, [viewState, debouncedUpdateSearchParams])

  if (isLoading || isError || !data) return <></>
  return (
    <EFPViewer
      data={data}
      state={viewState}
      geneticElement={geneticElement}
      efps={experimentEFPs}
      actions={EFPViewerActions}
      setViewState={setViewState}
    ></EFPViewer>
  )
}
