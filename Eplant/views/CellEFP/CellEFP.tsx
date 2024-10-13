import { useCallback, useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { useOutletContext, useSearchParams } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import PanZoom from '@eplant/util/PanZoom'
import { flattenState } from '@eplant/util/router'
import { ViewDataError } from '@eplant/View/viewData'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import Legend from '../eFP/Viewer/legend'

import { CellEFPStateActions } from './actions'
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
      zoom: parseInt(searchParams.get('zoom') || '1') || 1,
    },
  })
  const { data, isLoading, isError, error } = useQuery<CellEFPViewerData>({
    queryKey: [`cellEFP-${geneticElement?.id}`],
    queryFn: async () => {
      if (!geneticElement) {
        throw Error('No gene')
      }
      const data = cellEFPLoader(geneticElement, setLoadAmount)
      return data
    },
    enabled: !!geneticElement,
  })

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

  const efp = useMemo(() => {
    const Component = CellEFPDataObject.component
    if (data) {
      return <Component data={data} geneticElement={geneticElement} />
    } else {
      return <div>Yo</div>
    }
  }, [geneticElement?.id, data])

  if (isLoading || isError || !data) return <></>
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant='h6'>
          {'Cell EFP'}
          {': '}
          {geneticElement?.id}
        </Typography>
        {CellEFPStateActions.map((action, index) => (
          <Button
            key={index}
            onClick={() => setViewState(action.mutation(viewState))}
          >
            <Tooltip title={action.description}>{action.icon}</Tooltip>
          </Button>
        ))}
      </Box>
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
