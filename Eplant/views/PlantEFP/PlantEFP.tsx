import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { ViewDataError } from '@eplant/View'
import { useQuery } from '@tanstack/react-query'

import { EFPViewer, EFPViewerLoader } from '../eFP/Viewer/EFPViewer'
import {
  EFPViewerData,
  EFPViewerState,
  EFPViewerStateSchema,
} from '../eFP/Viewer/types'

import { plantEFPs, plantEFPViews } from './efps'
import PlantEFP from '.'

export const PlantEFPView = () => {
  const { geneticElement } = useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<EFPViewerState>()
  const [loadAmount, setLoadAmount] = useState(0)

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
    retry: false,
  })

  useEffect(() => {
    // On mount, set the active actions and initialize the state
    initializeState(EFPViewerStateSchema)
  }, [])

  if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={PlantEFP}
        error={ViewDataError.FAILED_TO_LOAD}
      ></LoadingPage>
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={PlantEFP}
        error={null}
      ></LoadingPage>
    )
  } else if (!data || !state) return <></>

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
export { PlantEFP }
