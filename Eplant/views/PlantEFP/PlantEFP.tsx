import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

import { useURLState } from '@eplant/state/URLStateManager'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { useQuery } from '@tanstack/react-query'

import { EFPViewerActions } from '../eFP/Viewer/actions'
import {
  EFPViewer,
  EFPViewerLoader,
  ValidateEFPViewerParams,
} from '../eFP/Viewer/EFPViewer'
import {
  EFPViewerData,
  EFPViewerState,
  EFPViewerStateScheme,
} from '../eFP/Viewer/types'

import { plantEFPs, plantEFPViews } from './efps'

export const PlantEFP = () => {
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<EFPViewerState>()

  const { data, isLoading, isError, error } = useQuery<EFPViewerData>({
    queryKey: [`plantEFP-${geneticElement?.id}`],
    queryFn: async () => {
      if (!geneticElement) {
        throw Error('No gene')
      }
      const data = EFPViewerLoader(
        geneticElement,
        plantEFPs,
        plantEFPViews,
        setLoadAmount
      )
      return data
    },
    enabled: !!geneticElement,
  })

  const defaultState: EFPViewerState = {
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
  }

  useEffect(() => {
    initializeState(EFPViewerStateScheme)
  }, [])

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading])

  if (isLoading || isError || !data || !state) return <></>
  return (
    <EFPViewer
      data={data}
      state={state}
      geneticElement={geneticElement}
      efps={plantEFPs}
      actions={EFPViewerActions}
      setViewState={setState}
    ></EFPViewer>
  )
}
