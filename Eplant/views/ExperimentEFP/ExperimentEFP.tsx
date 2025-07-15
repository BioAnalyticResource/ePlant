import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { ViewDataError } from '@eplant/View'
import { useQuery } from '@tanstack/react-query'

import { EFPViewerActions } from '../eFP/Viewer/actions'
import { EFPViewer, EFPViewerLoader } from '../eFP/Viewer/EFPViewer'
import {
  EFPViewerData,
  EFPViewerState,
  EFPViewerStateSchema,
} from '../eFP/Viewer/types'

import { experimentEFPs, experimentEFPViews } from './efps'
import ExperimentEFP from '.'

export const ExperimentEFPView = () => {
  const { geneticElement } = useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<EFPViewerState>()
  const [loadAmount, setLoadAmount] = useState(0)
  const { data, isLoading, isError, error } = useQuery<EFPViewerData, ViewDataError>({
    queryKey: [`tissue-${geneticElement?.id}`],
    queryFn: async () => {
      return EFPViewerLoader(
        geneticElement,
        experimentEFPs,
        experimentEFPViews,
        setLoadAmount
      )
    },
  })

  useEffect(() => {
    // On mount, set the active actions and initialize the state
    initializeState(EFPViewerStateSchema)
  }, [])

  if (!geneticElement) {
      return (
        <LoadingPage
          loadingAmount={loadAmount}
          gene={geneticElement}
          view={ExperimentEFP}
          error={ViewDataError.UNSUPPORTED_GENE}
        ></LoadingPage>
      )
    } else if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={ExperimentEFP}
        error={error}
      ></LoadingPage>
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={ExperimentEFP}
        error={null}
      ></LoadingPage>
    )
  } else if (!data || !state) return <></>

  return (
    <EFPViewer
      data={data}
      state={state}
      geneticElement={geneticElement}
      efps={experimentEFPs}
      setViewState={setState}
    ></EFPViewer>
  )
}
