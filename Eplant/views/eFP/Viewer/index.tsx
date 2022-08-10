import GeneticElement from '@eplant/GeneticElement'
import PanZoom from '@eplant/util/PanZoom'
import { View, ViewProps } from '@eplant/View'
import { useViewData, ViewDataError } from '@eplant/View/viewData'
import {
  Box,
  Drawer,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import React from 'react'
import EFP from '..'
import EFPPreview from '../EFPPreview'
import { EFPViewerAction, EFPViewerData } from './types'
import { FixedSizeList as List } from 'react-window'
import _ from 'lodash'
import useDimensions from '@eplant/util/useDimensions'
import { EFPData } from '../types'
import Legend from './legend'

export const EFPListMemoized = React.memo(
  function EFPList(props: {
    geneticElement: GeneticElement
    views: EFP[]
    viewData: EFPData[]
    activeView: EFP
    dispatch: ViewProps<EFPViewerData, EFPViewerAction>['dispatch']
    height: number
    colorMode: 'absolute' | 'relative'
  }) {
    return (
      <List
        height={props.height}
        itemCount={props.views.length}
        itemSize={75 + 8}
        width={108}
        style={{
          zIndex: 10,
        }}
      >
        {({ index: i, style }) => (
          <div style={style}>
            <Tooltip
              placement="right"
              arrow
              title={<div>{props.views[i].name}</div>}
            >
              <div>
                <EFPPreview
                  sx={(theme) => ({
                    width: '108px',
                    height: '75px',
                    zIndex: 100,
                  })}
                  data={props.viewData[i]}
                  key={props.views[i].id}
                  // Why is this an error? It is guarded by the above check.
                  gene={props.geneticElement}
                  selected={props.views[i].id == props.activeView.id}
                  view={props.views[i]}
                  onClick={() => {
                    props.dispatch({ type: 'set-view', id: props.views[i].id })
                  }}
                  colorMode={props.colorMode}
                />
              </div>
            </Tooltip>
          </div>
        )}
      </List>
    )
  },
  (prev, next) => {
    const a = [
      prev.geneticElement.id == next.geneticElement.id,
      _.isEqual(
        prev.views.map((v) => v.id),
        next.views.map((v) => v.id)
      ),
      prev.activeView.id == next.activeView.id,
      prev.dispatch == next.dispatch,
      prev.height == next.height,
      prev.colorMode == next.colorMode,
      _.isEqual(prev.viewData, next.viewData),
    ]
    return a.every((v) => v)
  }
)
export default class EFPViewer implements View<EFPViewerData, EFPViewerAction> {
  constructor(
    public id: string,
    public name: string,
    private views: EFPViewerData['views'],
    public icon: () => JSX.Element
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
      this.views.map(async (view, i) => {
        const data = await new EFP(
          view.name,
          view.id,
          view.svgURL,
          view.xmlURL
        ).getInitialData(gene, (progress) => {
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
      viewData,
      colorMode: 'absolute' as const,
    }
  }
  reducer = (state: EFPViewerData, action: EFPViewerAction) => {
    switch (action.type) {
      case 'set-view':
        return {
          ...state,
          activeView: action.id,
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
      default:
        return state
    }
  }
  component = (props: ViewProps<EFPViewerData, EFPViewerAction>) => {
    const EFPViews = React.useMemo(
      () =>
        props.activeData.views.map(
          (view) => new EFP(view.name, view.id, view.svgURL, view.xmlURL)
        ),
      [...props.activeData.views.map((v) => v.id)]
    )

    const activeViewIndex = React.useMemo(
      () =>
        EFPViews.findIndex((v) => v.id == props.activeData.activeView) ??
        EFPViews[0],
      [props.activeData.activeView, ...EFPViews.map((v) => v.id)]
    )
    if (activeViewIndex == -1) {
      throw new Error('active view does not exist')
    }
    const efp = React.useMemo(() => {
      const Component = EFPViews[activeViewIndex].component
      return (
        <Component
          activeData={{
            ...props.activeData.viewData[activeViewIndex],
            colorMode: props.activeData.colorMode,
          }}
          geneticElement={props.geneticElement}
          dispatch={() => {}}
        />
      )
    }, [
      activeViewIndex,
      props.geneticElement?.id,
      props.dispatch,
      props.activeData.viewData[activeViewIndex],
      props.activeData.colorMode,
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
          }}
        >
          <EFPListMemoized
            height={dimensions.height - 5}
            activeView={EFPViews[activeViewIndex]}
            dispatch={props.dispatch}
            viewData={props.activeData.viewData}
            geneticElement={props.geneticElement}
            views={EFPViews}
            colorMode={props.activeData.colorMode}
          />
          <Box
            sx={{
              flexGrow: 1,
              position: 'relative',
            }}
          >
            <Legend
              sx={(theme) => ({
                position: 'absolute',
                left: theme.spacing(2),
                top: 0,
                zIndex: 10,
              })}
              data={{
                ...props.activeData.viewData[activeViewIndex],
                colorMode: props.activeData.colorMode,
              }}
            />
            <PanZoom
              sx={(theme) => ({
                position: 'absolute',
                top: theme.spacing(4),
                left: theme.spacing(2),
                width: '100%',
                height: '100%',
                zIndex: 0,
              })}
              initialTransform={props.activeData.transform}
              onTransformChange={(transform) => {
                props.dispatch({
                  type: 'set-transform',
                  transform,
                })
              }}
            >
              {efp}
            </PanZoom>
          </Box>
        </Box>
      </Box>
    )
  }
  actions: View<EFPViewerData, EFPViewerAction>['actions'] = [
    {
      action: { type: 'reset-transform' },
      render: () => <>Reset pan/zoom</>,
    },
    {
      action: { type: 'toggle-color-mode' },
      render: (props) => <>Toggle data mode: {props.activeData.colorMode}</>,
    },
  ]
  header: View<EFPViewerData, EFPViewerAction>['header'] = (props) => (
    <Typography variant="h6">
      {
        props.activeData.views.find((v) => v.id == props.activeData.activeView)
          ?.name
      }
      {': '}
      {props.geneticElement?.id}
    </Typography>
  )
}
