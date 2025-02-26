import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

import { validateType } from '@eplant/state/stateUtils'
import { useURLState } from '@eplant/state/URLStateProvider'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { useQuery } from '@tanstack/react-query'

import { EFPViewerActions } from '../eFP/Viewer/actions'
import { EFPViewer, EFPViewerLoader } from '../eFP/Viewer/EFPViewer'
import {
  EFPViewerData,
  EFPViewerState,
  EFPViewerStateSchema,
} from '../eFP/Viewer/types'

import { plantEFPs, plantEFPViews } from './efps'

export const PlantEFP = () => {
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<EFPViewerState>()

  const { data, isLoading, isError, error } = useQuery<EFPViewerData>({
    queryKey: [`plant-efp-${geneticElement?.id}`],
    queryFn: async () => {
      return EFPViewerLoader(
        geneticElement,
        plantEFPs,
        plantEFPViews,
        setLoadAmount
      )
    },
  })

  useEffect(() => {
    // On mount, set the active actions and initialize the state
    initializeState(EFPViewerStateSchema)
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
      setViewState={setState}
    ></EFPViewer>
  )
}
