import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Space } from 'react-zoomable-ui'

import GeneticElement from '@eplant/GeneticElement'
import { useURLState } from '@eplant/state/URLStateProvider'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
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

export const ChromosomeView = () => {
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()
  const { state, setState, initializeState } =
    useURLState<ChromosomeViewerState>()

  const spaceRef = useRef<Space | null>(null)
  const [messageOpen, setMessageOpen] = useState(true)
  const handleClose = () => {
    setMessageOpen(false)
  }
  const { data, isLoading, isError, error } = useQuery<ChromosomeViewerData>({
    queryKey: [`chromosome`],
    queryFn: async () => {
      return ChromosomeViewLoader(geneticElement, setLoadAmount)
    },
  })

  useEffect(() => {
    // On mount, set the active actions and initialize the state
    initializeState(ChromosomeViewerStateScheme)
  }, [])

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading])

  if (isLoading || isError || !data || !state) return <></>
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
    .then((response) => response.json())
    .then((responseObj: ChromosomesResponseObj) => responseObj['chromosomes'])
  loadEvent(100)
  return {
    viewData: chromosomeViewData,
  }
}
