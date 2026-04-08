import { useEffect, useMemo, useRef, useState } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import Dropdown from '@eplant/UI/Dropdown'
import NotSupported from '@eplant/UI/Layout/ViewNotSupported'
import PanZoom from '@eplant/util/PanZoom'
import useDimensions from '@eplant/util/useDimensions'
import { ViewDataError } from '@eplant/View'
import { Box, MenuItem, Typography } from '@mui/material'

import { EFPId } from '../types'
import EFP from '..'

import { EFPListMemoized } from './EFPList'
import GeneDistributionChart from './GeneDistributionChart'
import Legend from './legend'
import MaskModal from './MaskModal'
import { EFPViewerData, EFPViewerState } from './types'

interface EFPViewerProps {
  data: EFPViewerData
  state: EFPViewerState
  geneticElement: GeneticElement | null
  efps: EFP[]
  setViewState: (state: EFPViewerState) => void
}
export const EFPViewer = ({
  data,
  state,
  geneticElement,
  efps,
  setViewState,
}: EFPViewerProps) => {
  const viewIndices: number[] = [...Array(data.views.length).keys()]
  viewIndices.sort((a, b) => {
    if (state.sortBy == 'name')
      return data.views[a].name.localeCompare(data.views[b].name)
    else {
      return data.viewData[b].max - data.viewData[a].max
    }
  })
  const sortedViews = viewIndices.map((i) => data.views[i])
  const sortedViewData = viewIndices.map((i) => data.viewData[i])
  const sortedEfps = viewIndices.map((i) => efps[i])

  const activeViewIndex = useMemo(() => {
    const index = sortedEfps.findIndex((v) => v.id == state.activeView)
    return index >= 0 ? index : 0
  }, [state.activeView, ...sortedEfps.map((v) => v.id)])

  useEffect(() => {
    if (!geneticElement) return
    setViewState({
      ...state,
      activeView: sortedEfps[activeViewIndex].id,
    })
  }, [state.activeView])

  const efp = useMemo(() => {
    const Component = sortedEfps[activeViewIndex].component
    return (
      <>
        <Component
          activeData={{
            ...sortedViewData[activeViewIndex],
          }}
          state={{
            colorMode: state.colorMode,
            renderAsThumbnail: false,
            maskThreshold: state.maskThreshold,
            maskingEnabled: state.maskingEnabled,
          }}
          geneticElement={geneticElement}
        />
      </>
    )
  }, [
    activeViewIndex,
    geneticElement?.id,
    sortedViewData[activeViewIndex],
    state.colorMode,
    state.maskThreshold,
    state.maskingEnabled,
  ])
  const ref = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(ref)

  if (!geneticElement) return <></>
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      ref={ref}
    >
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
        {/* Left column of EFP Previews */}
        <Box
          sx={{
            padding: 0,
            position: 'relative',
          }}
        >
          {/* Dropdown menus for selecting a view and sort options */}
          <Box sx={{ marginBottom: 1, display: 'flex', gap: 1 }}>
            <Dropdown
              color='secondary'
              variant='text'
              size='small'
              sx={{ padding: '0.25rem 0.5rem', minWidth: 'fit-content' }}
              endIcon={undefined}
              options={sortedViews.map((view) => (
                <MenuItem
                  selected={state.activeView == view.id ? true : false}
                  onClick={() =>
                    setViewState({ ...state, activeView: view.id })
                  }
                  key={view.id}
                >
                  {view.name}
                </MenuItem>
              ))}
            >
              View
            </Dropdown>
            <Dropdown
              variant='text'
              size='small'
              sx={{ padding: '0.25rem 0.5rem', minWidth: 'fit-content' }}
              endIcon={undefined}
              color='secondary'
              options={[
                <MenuItem
                  selected={state.sortBy == 'name' ? true : false}
                  key='byName'
                  onClick={() => setViewState({ ...state, sortBy: 'name' })}
                >
                  By name
                </MenuItem>,
                <MenuItem
                  selected={state.sortBy == 'expression-level' ? true : false}
                  key='byExpression'
                  onClick={() =>
                    setViewState({ ...state, sortBy: 'expression-level' })
                  }
                >
                  By expression level
                </MenuItem>,
              ]}
            >
              Sort
            </Dropdown>
          </Box>
          {/* The actual stack of EFP Previews */}
          <EFPListMemoized
            height={dimensions.height - 5}
            activeView={sortedEfps[activeViewIndex]}
            viewData={sortedViewData}
            setActiveView={(viewID: EFPId) =>
              setViewState({ ...state, activeView: viewID })
            }
            geneticElement={geneticElement}
            views={sortedEfps}
            colorMode={state.colorMode}
            maskThreshold={state.maskThreshold}
            maskingEnabled={state.maskingEnabled}
            transform={state.transform}
          />
        </Box>
        {/* main canvas area */}
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            position: 'relative',
            backgroundColor: theme.palette.background.paperOverlay,
            border: '1px solid',
            borderColor: theme.palette.background.edge,
            borderRadius: 1,
          })}
        >
          {sortedViewData[activeViewIndex].supported ? (
            <>
              <div>
                <Typography
                  variant='h6'
                  style={{ position: 'relative', top: '12px', left: '12px' }}
                >
                  {data.views.find((v) => v.id === state.activeView)?.name}
                  {': '}
                  {geneticElement?.id}
                </Typography>

                <GeneDistributionChart
                  data={{ ...sortedViewData[activeViewIndex] }}
                />
              </div>
              <MaskModal
                state={state}
                isVisible={state.maskModalVisible}
                onClose={() =>
                  setViewState({ ...state, maskModalVisible: false })
                }
                onSubmit={(threshold) => {
                  setViewState({
                    ...state,
                    maskThreshold: threshold,
                    maskModalVisible: false,
                  })
                }}
              />
              <Legend
                sx={(theme) => ({
                  position: 'absolute',
                  left: theme.spacing(2),
                  bottom: theme.spacing(2),
                  zIndex: 10,
                })}
                data={{
                  ...sortedViewData[activeViewIndex],
                }}
                maskThreshold={state.maskThreshold}
                colorMode={state.colorMode}
                maskingEnabled={state.maskingEnabled}
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
                  setViewState({ ...state, transform: transform })
                }}
              >
                {efp}
              </PanZoom>
            </>
          ) : (
            <div
              style={{
                position: 'absolute',
                padding: '10px',
                width: '100%',
              }}
            >
              <NotSupported
                geneticElement={geneticElement}
                viewName={sortedEfps[activeViewIndex].name}
              ></NotSupported>
            </div>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export const EFPViewerLoader = async (
  gene: GeneticElement | null,
  efps: EFP[],
  views: EFPViewerData['views'],
  loadEvent: (loaded: number) => void
) => {
  if (!gene) throw ViewDataError.UNSUPPORTED_GENE
  // Load all the views
  const loadingProgress = Array(views.length).fill(0)
  let totalLoaded = 0
  const viewData = await Promise.all(
    efps.map(async (efp, i) => {
      const data = efp.getInitialData(gene, (progress) => {
        totalLoaded -= loadingProgress[i]
        loadingProgress[i] = progress
        totalLoaded += loadingProgress[i]
        loadEvent(totalLoaded / loadingProgress.length)
      })
      loadingProgress[i] = 100
      return data
    })
  )
  loadEvent(100)
  return {
    views: views,
    viewData: viewData,
  }
}
