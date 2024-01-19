import GeneticElement from '@eplant/GeneticElement'
import PanZoom from '@eplant/util/PanZoom'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'
import { Box, MenuItem, Tooltip, Typography } from '@mui/material'
import React, { startTransition } from 'react'
import EFP from '..'
import EFPPreview from '../EFPPreview'
import { EFPViewerAction, EFPViewerData, EFPViewerState } from './types'
import {
  areEqual,
  FixedSizeList as List,
  ListChildComponentProps,
} from 'react-window'
import useDimensions from '@eplant/util/useDimensions'
import { EFPData } from '../types'
import Legend from './legend'
import NotSupported from '@eplant/UI/Layout/ViewNotSupported'
import Dropdown from '@eplant/UI/Dropdown'
import { red } from '@mui/material/colors'
import GeneDistributionChart from './GeneDistributionChart'
import MaskModal from './MaskModal'

type EFPListProps = {
  geneticElement: GeneticElement
  views: EFP[]
  viewData: EFPData[]
  activeView: EFP
  dispatch: ViewProps<
    EFPViewerData,
    EFPViewerState,
    EFPViewerAction
  >['dispatch']
  height: number
  colorMode: 'absolute' | 'relative'
  maskThreshold: number
}

const EFPListItem = React.memo(
  function EFPRow({ index: i, data }: { index: number; data: EFPListProps }) {
    return (
      <Tooltip placement="right" arrow title={<div>{data.views[i].name}</div>}>
        <div>
          <EFPPreview
            sx={() => ({
              width: '108px',
              height: '75px',
              zIndex: 100,
            })}
            data={data.viewData[i]}
            key={data.views[i].id}
            // Why is this an error? It is guarded by the above check.
            gene={data.geneticElement}
            selected={data.views[i].id == data.activeView.id}
            view={data.views[i]}
            maskThreshold={data.maskThreshold}
            onClick={() => {
              startTransition(() => {
                data.dispatch({ type: 'set-view', id: data.views[i].id })
              })
            }}
            colorMode={data.colorMode}
          />
        </div>
      </Tooltip>
    )
  },
  (prev, next) => {
    return (
      prev.data.views[prev.index].id === next.data.views[next.index].id &&
      prev.data.colorMode === next.data.colorMode &&
      prev.data.geneticElement.id === next.data.geneticElement.id &&
      prev.data.activeView === next.data.activeView &&
      prev.index == next.index
    )
  },
)

const EFPListRow = React.memo(function EFPListRow({
  style,
  index,
  data,
}: ListChildComponentProps) {
  return (
    <div style={style}>
      <EFPListItem index={index} data={data} />
    </div>
  )
}, areEqual)

export const EFPListMemoized = function EFPList(props: EFPListProps) {
  return (
    <List
      height={props.height}
      itemCount={props.views.length}
      itemSize={75 + 12}
      width={130}
      style={{
        zIndex: 10,
        scrollbarWidth: 'none',
      }}
      itemData={props}
    >
      {EFPListRow}
    </List>
  )
}

export default class EFPViewer
  implements View<EFPViewerData, EFPViewerState, EFPViewerAction>
{
  getInitialState(): EFPViewerState {
    return {
      activeView: '',
      colorMode: 'absolute',
      transform: {
        offset: {
          x: 0,
          y: 0,
        },
        zoom: 1,
      },
      sortBy: 'name',
      maskThreshold: 100,
      maskModalVisible: false,
    }
  }
  constructor(
    public id: string,
    public name: string,
    private views: EFPViewerData['views'],
    public efps: EFP[],
    public icon: () => JSX.Element,
    public description?: string,
    public thumbnail?: string,
  ) {}
  getInitialData = async (
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void,
  ) => {
    if (!gene) throw ViewDataError.UNSUPPORTED_GENE
    // Load all the views
    const loadingProgress = Array(this.views.length).fill(0)
    let totalLoaded = 0
    const viewData = await Promise.all(
      this.efps.map(async (efp, i) => {
        const data = efp.getInitialData(gene, (progress) => {
          totalLoaded -= loadingProgress[i]
          loadingProgress[i] = progress
          totalLoaded += loadingProgress[i]
          loadEvent(totalLoaded / loadingProgress.length)
        })
        loadingProgress[i] = 1
        return data
      }),
    )
    return {
      activeView: this.views[0].id,
      views: this.views,
      transform: {
        offset: { x: 0, y: 0 },
        zoom: 1,
      },
      viewData: viewData,
      efps: this.efps,
      colorMode: 'absolute' as const,
    }
  }
  reducer = (state: EFPViewerState, action: EFPViewerAction) => {
    switch (action.type) {
      case 'set-view':
        return {
          ...state,
          activeView: action.id,
        }
      case 'sort-by':
        return {
          ...state,
          sortBy: action.by,
        }
      case 'reset-transform':
        return {
          ...state,
          transform: {
            offset: { x: 0, y: 0 },
            zoom: 1,
          },
        }
      case 'set-transform':
        return {
          ...state,
          transform: action.transform,
        }
      case 'toggle-color-mode':
        return {
          ...state,
          colorMode:
            state.colorMode == 'absolute'
              ? ('relative' as const)
              : ('absolute' as const),
        }
      case 'toggle-mask-modal':
        return {
          ...state,
          maskModalVisible: state.maskModalVisible ? false : true,
        }
      case 'set-mask-threshold':
        return {
          ...state,
          maskThreshold: action.threshold,
        }
      default:
        return state
    }
  }
  component = (
    props: ViewProps<EFPViewerData, EFPViewerState, EFPViewerAction>,
  ) => {
    const viewIndices: number[] = [
      ...Array(props.activeData.views.length).keys(),
    ]
    viewIndices.sort((a, b) => {
      if (props.state.sortBy == 'name')
        return props.activeData.views[a].name.localeCompare(
          props.activeData.views[b].name,
        )
      else {
        return (
          props.activeData.viewData[b].max - props.activeData.viewData[a].max
        )
      }
    })
    const sortedViews = viewIndices.map((i) => props.activeData.views[i])
    const sortedViewData = viewIndices.map((i) => props.activeData.viewData[i])
    const sortedEfps = viewIndices.map((i) => this.efps[i])

    let activeViewIndex = React.useMemo(
      () => sortedEfps.findIndex((v) => v.id == props.state.activeView),
      [props.state.activeView, ...sortedEfps.map((v) => v.id)],
    )
    if (activeViewIndex == -1) {
      activeViewIndex = 0
      props.dispatch({
        type: 'set-view',
        id: sortedEfps[0].id,
      })
    }
    const efp = React.useMemo(() => {
      const Component = sortedEfps[activeViewIndex].component
      return (
        <Component
          activeData={{
            ...sortedViewData[activeViewIndex],
          }}
          state={{
            colorMode: props.state.colorMode,
            renderAsThumbnail: false,
            maskThreshold: props.state.maskThreshold,
          }}
          geneticElement={props.geneticElement}
          dispatch={() => {}}
        />
      )
    }, [
      activeViewIndex,
      props.geneticElement?.id,
      props.dispatch,
      sortedViewData[activeViewIndex],
      props.state.colorMode,
      props.state.maskThreshold,
    ])
    const ref = React.useRef<HTMLDivElement>(null)
    const dimensions = useDimensions(ref)

    if (!props.geneticElement) return <></>
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
                color="secondary"
                variant="text"
                size="small"
                sx={{ padding: '0.25rem 0.5rem', minWidth: 'fit-content' }}
                endIcon={undefined}
                options={sortedViews.map((view) => (
                  <MenuItem
                    selected={props.state.activeView == view.id ? true : false}
                    onClick={() =>
                      props.dispatch({ type: 'set-view', id: view.id })
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
                variant="text"
                size="small"
                sx={{ padding: '0.25rem 0.5rem', minWidth: 'fit-content' }}
                endIcon={undefined}
                color="secondary"
                options={[
                  <MenuItem
                    selected={props.state.sortBy == 'name' ? true : false}
                    key="byName"
                    onClick={() =>
                      props.dispatch({ type: 'sort-by', by: 'name' })
                    }
                  >
                    By name
                  </MenuItem>,
                  <MenuItem
                    selected={
                      props.state.sortBy == 'expression-level' ? true : false
                    }
                    key="byExpression"
                    onClick={() =>
                      props.dispatch({
                        type: 'sort-by',
                        by: 'expression-level',
                      })
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
              dispatch={props.dispatch}
              viewData={sortedViewData}
              geneticElement={props.geneticElement}
              views={sortedEfps}
              colorMode={props.state.colorMode}
              maskThreshold={props.state.maskThreshold}
            />
          </Box>
          {/* main canvas area */}
          <Box
            sx={(theme) => ({
              flexGrow: 1,
              position: 'relative',
              overflow: 'hidden',
              background: theme.palette.background.paperOverlay,
              border: `1px solid`,
              borderColor: theme.palette.background.active,
              borderRadius: theme.shape.borderRadius + 'px',
            })}
          >
            {props.activeData.viewData[activeViewIndex].supported ? (
              <>
                {props.activeData.views[activeViewIndex].name !== 'cellEFP' && (
                  <GeneDistributionChart
                    data={{ ...props.activeData.viewData[activeViewIndex] }}
                  />
                )}
                <MaskModal
                  state={props.state}
                  onClose={() => props.dispatch({ type: 'toggle-mask-modal' })}
                  onSubmit={(threshold) =>
                    props.dispatch({
                      type: 'set-mask-threshold',
                      threshold: threshold,
                    })
                  }
                />
                <Legend
                  sx={(theme) => ({
                    position: 'absolute',
                    left: theme.spacing(2),
                    bottom: theme.spacing(2),
                    zIndex: 10,
                  })}
                  data={{
                    ...props.activeData.viewData[activeViewIndex],
                  }}
                  state={{
                    colorMode: props.state.colorMode,
                    renderAsThumbnail: false,
                    maskThreshold: props.state.maskThreshold,
                  }}
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
                  transform={props.state.transform}
                  onTransformChange={(transform) => {
                    props.dispatch({
                      type: 'set-transform',
                      transform,
                    })
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
                  geneticElement={props.geneticElement}
                  view={sortedEfps[activeViewIndex]}
                ></NotSupported>
              </div>
            )}
          </Box>
        </Box>
      </Box>
    )
  }
  actions: View<EFPViewerData, EFPViewerState, EFPViewerAction>['actions'] = [
    {
      action: { type: 'reset-transform' },
      render: () => <>Reset pan/zoom</>,
    },
    {
      action: { type: 'toggle-color-mode' },
      render: (props) => <>Toggle data mode: {props.state.colorMode}</>,
    },
    {
      action: { type: 'toggle-mask-modal' },
      render: () => <>Mask data</>,
    },
  ]
  header: View<EFPViewerData, EFPViewerState, EFPViewerAction>['header'] = (
    props,
  ) => (
    <Typography variant="h6">
      {props.activeData.views.find((v) => v.id == props.state.activeView)?.name}
      {': '}
      {props.geneticElement?.id}
    </Typography>
  )
}
