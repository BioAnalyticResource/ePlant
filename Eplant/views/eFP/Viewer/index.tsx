import {
  memo,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  areEqual,
  FixedSizeList as List,
  ListChildComponentProps,
} from 'react-window'

import GeneticElement from '@eplant/GeneticElement'
import Dropdown from '@eplant/UI/Dropdown'
import NotSupported from '@eplant/UI/Layout/ViewNotSupported'
import { getCitation } from '@eplant/util/citations'
import PanZoom from '@eplant/util/PanZoom'
import useDimensions from '@eplant/util/useDimensions'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'
import { Box, MenuItem, Tooltip, Typography } from '@mui/material'

import EFPPreview from '../EFPPreview'
import { EFPData } from '../types'
import EFP from '..'

import EFPViewerCitation from './EFPViewerCitation'
import GeneDistributionChart from './GeneDistributionChart'
import Legend from './legend'
import MaskModal from './MaskModal'
import { EFPViewerAction, EFPViewerData, EFPViewerState } from './types'

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
  maskingEnabled: boolean
}

interface ICitationProps {
  activeData?: EFPViewerData
  state?: EFPViewerState
  gene?: GeneticElement | null
}

const EFPListItem = memo(
  function EFPRow({ index: i, data }: { index: number; data: EFPListProps }) {
    return (
      <Tooltip placement='right' arrow title={<div>{data.views[i].name}</div>}>
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
            maskingEnabled={data.maskingEnabled}
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
      prev.index == next.index &&
      prev.data.maskingEnabled == next.data.maskingEnabled &&
      prev.data.maskThreshold == next.data.maskThreshold
    )
  }
)

const EFPListRow = memo(function EFPListRow({
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
      maskingEnabled: false,
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
    public thumbnail?: string
  ) {}
  getInitialData = async (
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
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
      })
    )
    return {
      activeView: this.views[0].id,
      views: this.views,
      transform: {
        offset: { x: 0, y: 0 },
        zoom: 1,
      },
      viewData: viewData,
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
        if (state.maskingEnabled) {
          return {
            ...state,
            maskingEnabled: !state.maskingEnabled,
          }
        } else {
          return {
            ...state,
            maskModalVisible: !state.maskModalVisible,
          }
        }
      case 'set-mask-threshold':
        return {
          ...state,
          maskThreshold: action.threshold,
          maskingEnabled: !state.maskingEnabled,
          maskModalVisible: !state.maskModalVisible,
        }
      default:
        return state
    }
  }
  component = ({
    activeData,
    state,
    dispatch,
    geneticElement,
  }: ViewProps<EFPViewerData, EFPViewerState, EFPViewerAction>) => {
    const viewIndices: number[] = [...Array(activeData.views.length).keys()]
    viewIndices.sort((a, b) => {
      if (state.sortBy == 'name')
        return activeData.views[a].name.localeCompare(activeData.views[b].name)
      else {
        return activeData.viewData[b].max - activeData.viewData[a].max
      }
    })
    const sortedViews = viewIndices.map((i) => activeData.views[i])
    const sortedViewData = viewIndices.map((i) => activeData.viewData[i])
    const sortedEfps = viewIndices.map((i) => this.efps[i])

    let activeViewIndex = useMemo(
      () => sortedEfps.findIndex((v) => v.id == state.activeView),
      [state.activeView, ...sortedEfps.map((v) => v.id)]
    )
    if (activeViewIndex == -1) {
      activeViewIndex = 0
      dispatch({
        type: 'set-view',
        id: sortedEfps[0].id,
      })
    }
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
            dispatch={() => {}}
          />
        </>
      )
    }, [
      activeViewIndex,
      geneticElement?.id,
      dispatch,
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
                    onClick={() => dispatch({ type: 'set-view', id: view.id })}
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
                    onClick={() => dispatch({ type: 'sort-by', by: 'name' })}
                  >
                    By name
                  </MenuItem>,
                  <MenuItem
                    selected={state.sortBy == 'expression-level' ? true : false}
                    key='byExpression'
                    onClick={() =>
                      dispatch({
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
              dispatch={dispatch}
              viewData={sortedViewData}
              geneticElement={geneticElement}
              views={sortedEfps}
              colorMode={state.colorMode}
              maskThreshold={state.maskThreshold}
              maskingEnabled={state.maskingEnabled}
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
            {activeData.viewData[activeViewIndex].supported ? (
              <>
                <div>
                  <Typography
                    variant='h6'
                    style={{ position: 'relative', top: '12px', left: '12px' }}
                  >
                    {
                      activeData.views.find((v) => v.id === state.activeView)
                        ?.name
                    }
                    {': '}
                    {geneticElement?.id}
                  </Typography>

                  {activeData.views[activeViewIndex].name !== 'cellEFP' && (
                    <GeneDistributionChart
                      data={{ ...activeData.viewData[activeViewIndex] }}
                    />
                  )}
                </div>
                <MaskModal
                  state={state}
                  onClose={() => dispatch({ type: 'toggle-mask-modal' })}
                  onSubmit={(threshold) =>
                    dispatch({
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
                    ...activeData.viewData[activeViewIndex],
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
                    dispatch({
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
                  geneticElement={geneticElement}
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

  citation = ({ activeData, state, gene }: ICitationProps) => {
    const [xmlData, setXMLData] = useState<string[]>([])

    const viewID = activeData?.views.find((v) => v.id == state?.activeView)
      ?.name
    const viewXML = activeData?.views.find((v) => v.id == state?.activeView)
      ?.xmlURL
    useEffect(() => {
      const xmlLoad = async () => {
        let xmlString = ''
        if (viewXML) {
          try {
            const response = await fetch(viewXML)
            const data = await response.text()
            xmlString = data
          } catch (error) {
            console.error('Error fetching xmlData:', error)
          }
        }

        // Extract <li> tags
        if (xmlString !== '') {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
          const listItems = xmlDoc.querySelectorAll('info li')
          const itemsArray = Array.from(listItems).map((liElement) =>
            liElement.textContent ? liElement.textContent : ''
          )
          setXMLData(itemsArray)
        } else {
          setXMLData([])
        }
      }
      xmlLoad()
    }, [viewXML])

    if (viewID) {
      const citation = getCitation(viewID) as { [key: string]: string }
      return (
        <EFPViewerCitation
          viewID={viewID}
          citation={citation}
          xmlData={xmlData}
        ></EFPViewerCitation>
      )
    } else {
      return <p>No Citation information provided.</p>
    }
  }
}
