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

import EFP from '../../eFP'
import EFPPreview from '../../eFP/EFPPreview'
import { EFPData } from '../../eFP/types'
import { EFPListMemoized } from '../../eFP/Viewer'
import EFPViewerCitation from '../../eFP/Viewer/EFPViewerCitation'
import GeneDistributionChart from '../../eFP/Viewer/GeneDistributionChart'
import {
  EFPViewerAction,
  EFPViewerData,
  EFPViewerState,
} from '../../eFP/Viewer/types'
import CellEFP from '..'

import {
  CellEFPViewerAction,
  CellEFPViewerData,
  CellEFPViewerState,
} from './types'
import MaskModal from './MaskModal'
import Legend from './legend'

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

interface ICitationProps {
  activeData?: EFPViewerData
  state?: EFPViewerState
  gene?: GeneticElement | null
}

const CellEFPViewer: View<
  CellEFPViewerData,
  CellEFPViewerState,
  CellEFPViewerAction
> = {
  id: 'cell efp',
  name: 'CellEFP',
  icon: () => <CellEFPIcon />,
  efp: new CellEFP(),
  getInitialState() {
    return {
      transform: {
        offset: {
          x: 0,
          y: 0,
        },
        zoom: 1,
      },
    }
  },
  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    if (!gene) throw ViewDataError.UNSUPPORTED_GENE
    // Load all the views
    let loadingProgress = 0
    let totalLoaded = 0
    const viewData = await this.efp.getInitialData(gene, (progress) => {
      totalLoaded -= loadingProgress
      loadingProgress = progress
      totalLoaded += loadingProgress
      loadEvent(totalLoaded)
    })
    return {
      activeView: this.view.id,
      view: this.view,
      transform: {
        offset: { x: 0, y: 0 },
        zoom: 1,
      },
      viewData: viewData,
      efp: this.efp,
    }
  },
  reducer = (state: CellEFPViewerState, action: CellEFPViewerAction) => {
    switch (action.type) {
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
      default:
        return state
    }
  },
  component: ({
    activeData,
    state,
    dispatch,
    geneticElement,
  }: ViewProps<CellEFPViewerData, CellEFPViewerState, CellEFPViewerAction>) => {
    const efp = useMemo(() => {
      const Component = this.efp.component
      return (
        <Component
          activeData={activeData}
          state={{
            renderAsThumbnail: false,
          }}
          geneticElement={geneticElement}
          dispatch={() => {}}
        />
      )
    }, [geneticElement?.id, dispatch])
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
            />
          </Box>
          {/* main canvas area */}
          <Box
            sx={(theme) => ({
              flexGrow: 1,
              position: 'relative',
            })}
          >
            {activeData.viewData[activeViewIndex].supported ? (
              <>
                {activeData.views[activeViewIndex].name !== 'cell EFP' && (
                  <GeneDistributionChart
                    data={{ ...activeData.viewData[activeViewIndex] }}
                  />
                )}
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
                  state={{
                    colorMode: state.colorMode,
                    renderAsThumbnail: false,
                    maskThreshold: state.maskThreshold,
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
  },
  actions: [
    {
      action: { type: 'reset-transform' },
      render: () => <>Reset pan/zoom</>,
    },
  ],

  header: (props) => {
    return (
      <Typography variant='h6'>
        {
          props.activeData.views.find((v) => v.id == props.state.activeView)
            ?.name
        }
        {': '}
        {props.geneticElement?.id}
      </Typography>
    )
  },

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
  },
}
