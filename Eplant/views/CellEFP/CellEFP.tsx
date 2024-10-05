import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import NotSupported from '@eplant/UI/Layout/ViewNotSupported'
import PanZoom from '@eplant/util/PanZoom'
import { flattenState } from '@eplant/util/router'
import { ViewDataError } from '@eplant/View/viewData'
import { Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import Legend from '../eFP/Viewer/legend'

import { CellEFPDataObject } from './CellEFPDataObject'
import { CellEFPViewerData, CellEFPViewerState } from './types'

export const CellEFPView = () => {
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()

  const [searchParams, setSearchParams] = useSearchParams()
  const [viewState, setViewState] = useState<CellEFPViewerState>({
    transform: {
      offset: {
        x: parseInt(searchParams.get('x') || '0') || 0,
        y: parseInt(searchParams.get('y') || '0') || 0,
      },
      zoom: parseInt(searchParams.get('zoom') || '0') || 0,
    },
  })
  const { data, isLoading, isError, error } = useQuery<CellEFPViewerData>({
    queryKey: [`cellEFP-${geneticElement}`],
    queryFn: async () => {
      if (!geneticElement) {
        console.log('throwing error')
        throw Error('No gene')
      }
      const data = await cellEFPLoader(geneticElement, setLoadAmount)
      console.log(data) // This shows that the data HAS been fetched
      return data
    },
    enabled: !!geneticElement,
  })
  console.log('data', data)
  console.log('isloading', isLoading)

  useEffect(() => {
    const validateParams = () => {
      if (viewState.transform.zoom <= 0.25 || viewState.transform.zoom >= 4) {
        console.log(
          `Invalid zoom of ${viewState.transform.zoom}, defaulting to 0.`
        )
        setViewState({ transform: { ...viewState.transform, zoom: 0 } })
      }
    }

    validateParams()
  }, [])

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading])

  useEffect(() => {
    setSearchParams(new URLSearchParams(flattenState(viewState)))
  }, [viewState])

  const efp = useMemo(() => {
    const Component = CellEFPDataObject.component
    if (data) {
      return <Component data={data} geneticElement={geneticElement} />
    } else {
      return <div></div>
    }
  }, [geneticElement?.id])

  if (isLoading || isError || !data) return <></>
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Typography variant='h6'>
        {'Cell EFP'}
        {': '}
        {geneticElement?.id}
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          overflow: 'hidden',
        }}
      >
        {/* main canvas area */}
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            position: 'relative',
          })}
        >
          <>
            <Legend
              sx={(theme) => ({
                position: 'absolute',
                left: theme.spacing(2),
                bottom: theme.spacing(2),
                zIndex: 10,
              })}
              data={{
                ...data.viewData,
              }}
              colorMode={'absolute'}
            />
            <PanZoom
              sx={(theme) => ({
                position: 'absolute',
                top: theme.spacing(0),
                left: theme.spacing(0),
                width: '100%',
                height: '100%',
                zIndex: 0,
              })}
              transform={viewState.transform}
              onTransformChange={(transform) => {
                setViewState({ ...viewState, transform: transform })
              }}
            >
              {efp}
            </PanZoom>
          </>
        </Box>
      </Box>
    </Box>
  )
}

export const cellEFPLoader = async (
  geneticElement: GeneticElement | null,
  loadEvent: (loaded: number) => void
) => {
  if (!geneticElement) throw ViewDataError.UNSUPPORTED_GENE
  let totalLoaded = 0
  const viewData = await CellEFPDataObject.getInitialData(
    geneticElement,
    (progress) => {
      totalLoaded += progress
      loadEvent(totalLoaded)
    }
  )

  return {
    viewData: viewData,
  }
}
