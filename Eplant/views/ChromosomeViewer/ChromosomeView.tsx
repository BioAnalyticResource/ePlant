import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Space } from 'react-zoomable-ui'

import GeneticElement from '@eplant/GeneticElement'
import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { ViewDataError } from '@eplant/View'
import { Box, CircularProgress, Snackbar, SnackbarContent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import { ChromosomeViewer } from './Viewer/Viewer'
import {
  ChromosomeItem,
  ChromosomesResponseObj,
  ChromosomeViewerData,
  ChromosomeViewerState,
  ChromosomeViewerStateScheme,
  Transform,
} from './types'
import ZoomControls from './ZoomControls'
import { ChromosomeViewerObject } from '.'

export const ChromosomeView = () => {
  const { geneticElement } = useOutletContext<ViewContext>()
  const { state, setState, initializeState } =
    useURLState<ChromosomeViewerState>()
  const [loadAmount, setLoadAmount] = useState(0)

  const spaceRef = useRef<Space | null>(null)
  const [messageOpen, setMessageOpen] = useState(true)
  const handleClose = () => {
    setMessageOpen(false)
  }
  const { data, isLoading, isError, error } = useQuery<
    ChromosomeViewerData,
    ViewDataError
  >({
    queryKey: [`chromosome`],
    queryFn: async () => {
      try {
        return ChromosomeViewLoader(geneticElement, setLoadAmount)
      } catch {
        throw ViewDataError.FAILED_TO_LOAD
      }
    },
  })

  useEffect(() => {
    // On mount, set the active actions and initialize the state
    initializeState(ChromosomeViewerStateScheme)
  }, [])

  if (!geneticElement) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={ChromosomeViewerObject}
        error={ViewDataError.UNSUPPORTED_GENE}
      ></LoadingPage>
    )
  } else if ((isLoading && loadAmount < 100) || isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={ChromosomeViewerObject}
        error={error}
      ></LoadingPage>
    )
  } else if (!data || !state) return <></>

  return (
    <Box>
      {/* ZOOM CONTROLS */}
      <ZoomControls spaceRef={spaceRef} scale={state.transform.dZoom} />
      {/* CHROMOSOME VIEWER */}
      <Space
        ref={spaceRef}
        onCreate={(vp) => {
          vp.camera.recenter(
            state.transform.dx,
            state.transform.dy,
            state.transform.dZoom
          )
          vp.setBounds({
            x: [-650, 1300],
            y: [-450, 815],
            zoom: [0.05, 1000 - 0.3],
          })
        }}
        onUpdated={(vp) => {
          const transform: Transform = {
            dx: vp.centerX,
            dy: vp.centerY,
            dZoom: vp.zoomFactor,
          }
          setState({
            ...state,
            transform: transform,
          })
        }}
      >
        <ChromosomeViewer
          chromosomes={data.viewData}
          scale={state.transform.dZoom}
          annotations={[]}
        />
      </Space>
      <Snackbar
        id='chromosomeViewer_geneAnnotationMessage'
        open={messageOpen}
        autoHideDuration={1000}
        onClose={handleClose}
        sx={{ position: 'absolute' }}
      >
        <SnackbarContent
          sx={(theme) => ({
            backgroundColor: theme.palette.background.transparentOverlay,
            color: theme.palette.secondary.contrastText,
          })}
          message={
            <span>
              Please allow a brief moment for gene annotations to be processed
              &nbsp;
              <CircularProgress size={12} />
            </span>
          }
        />
      </Snackbar>
    </Box>
  )
}

const ChromosomeViewLoader = async (
  gene: GeneticElement | null,
  loadEvent: (progress: number) => void
) => {
  const poplar = false
  const species = poplar ? 'Populus_trichocarpa' : 'Arabidopsis_thaliana'
  const url = `https://bar.utoronto.ca/eplant${
    poplar ? '_poplar' : ''
  }/cgi-bin/chromosomeinfo.cgi?species=${species}`

  const chromosomeViewData: ChromosomeItem[] = await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw ViewDataError.FAILED_TO_LOAD
      }
      return response.json()
    })
    .then((responseObj: ChromosomesResponseObj) => responseObj['chromosomes'])
  loadEvent(100)
  return {
    viewData: chromosomeViewData,
  }
}
