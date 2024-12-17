import { act, useCallback, useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { useOutletContext, useSearchParams } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { useURLState } from '@eplant/state/URLStateManager'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import PanZoom from '@eplant/util/PanZoom'
import { flattenState } from '@eplant/util/router'
import { ActionsPanel } from '@eplant/util/stateUtils/ActionsPanel'
import { ViewDataError } from '@eplant/View/viewData'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import Legend from '../eFP/Viewer/legend'

import { CellEFPStateActions } from './actions'
import { CellEFPDataObject } from './CellEFPDataObject'
import {
  CellEFPStateScheme,
  CellEFPViewerData,
  CellEFPViewerState,
} from './types'

export const CellEFPView = () => {
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<CellEFPViewerState>()
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

  const defaultState = {
    transform: {
      offset: {
        x: 0,
        y: 0,
      },
      zoom: 1,
    },
  }
  useEffect(() => {
    initializeState(CellEFPStateScheme)
  }, [])

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading])

  const efp = useMemo(() => {
    const Component = CellEFPDataObject.component
    if (data) {
      return <Component data={data} geneticElement={geneticElement} />
    } else {
      return <div>TODO</div>
    }
  }, [geneticElement?.id, data])

  if (isLoading || isError || !data || !state) return <></>
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
      </Box>
      <ActionsPanel
        actions={CellEFPStateActions}
        prevState={state}
        setState={setState}
      ></ActionsPanel>
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
              transform={state.transform}
              onTransformChange={(transform) => {
                setState({ ...state, transform: transform })
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
