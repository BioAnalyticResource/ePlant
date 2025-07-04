import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import PanZoom from '@eplant/util/PanZoom'
import { ViewDataError } from '@eplant/View'
import { Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import Legend from '../eFP/Viewer/legend'

import { CellEFPDataObject } from './CellEFPDataObject'
import {
  CellEFPStateSchema,
  CellEFPViewerData,
  CellEFPViewerState,
} from './types'
import CellEFP from '.'

export const CellEFPView = () => {
  const { geneticElement } = useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<CellEFPViewerState>()
  const [loadAmount, setLoadAmount] = useState(0)
  const { data, isLoading, isError, error } = useQuery<CellEFPViewerData>({
    queryKey: [`cell-efp-${geneticElement?.id}`],
    queryFn: async () => {
      return cellEFPLoader(geneticElement, setLoadAmount)
    },
    retry: false,
  })
  useEffect(() => {
    // On mount, initialize state
    initializeState(CellEFPStateSchema)
  }, [])

  const efp = useMemo(() => {
    const Component = CellEFPDataObject.component
    if (data) {
      return <Component data={data} geneticElement={geneticElement} />
    } else {
      return <div>TODO</div>
    }
  }, [geneticElement?.id, data])

  if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={CellEFP}
        error={ViewDataError.FAILED_TO_LOAD}
      ></LoadingPage>
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={CellEFP}
        error={null}
      ></LoadingPage>
    )
  } else if (!data || !state) return <></>

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
