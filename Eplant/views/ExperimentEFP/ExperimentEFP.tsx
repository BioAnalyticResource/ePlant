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

import { experimentEFPs, experimentEFPViews } from './efps'

export const ExperimentEFP = () => {
  const { geneticElement, setIsLoading, setLoadAmount, setActiveActions } =
    useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<EFPViewerState>()
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
    // On mount, set the active actions and initialize the state
    setActiveActions(EFPViewerActions)
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
      efps={experimentEFPs}
      setViewState={setState}
    ></EFPViewer>
  )
}
