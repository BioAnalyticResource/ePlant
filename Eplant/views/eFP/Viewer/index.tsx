import GeneticElement from '@eplant/GeneticElement'
import PanZoom from '@eplant/util/PanZoom'
import { useViewData, View, ViewProps } from '@eplant/views/View'
import { Box, Drawer, LinearProgress, useTheme } from '@mui/material'
import React from 'react'
import EFP from '..'
import EFPPreview from '../EFPPreview'
import { EFPViewerAction, EFPViewerData } from './types'
import { FixedSizeList as List } from 'react-window'
import _ from 'lodash'

export const EFPListMemoized = React.memo(
  function EFPList(props: {
    geneticElement: GeneticElement
    views: EFP[]
    activeView: EFP
    dispatch: ViewProps<EFPViewerData, EFPViewerAction>['dispatch']
    height: number
  }) {
    return (
      <List
        height={props.height}
        itemCount={props.views.length}
        itemSize={75 + 8}
        width={108}
      >
        {({ index: i, style }) => (
          <div style={style}>
            <EFPPreview
              sx={(theme) => ({
                width: '108px',
                height: '75px',
              })}
              key={props.views[i].id}
              // Why is this an error? It is guarded by the above check.
              gene={props.geneticElement}
              selected={props.views[i].id == props.activeView.id}
              view={props.views[i]}
              onClick={() => {
                props.dispatch({ type: 'set-view', id: props.views[i].id })
              }}
            />
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
    ]
    return a.every((v) => v)
  }
)
export default class EFPViewer implements View<EFPViewerData, EFPViewerAction> {
  constructor(
    public id: string,
    public name: string,
    private views: EFPViewerData['views']
  ) {}
  getInitialData = async () => ({
    activeView: this.views[0].id,
    views: this.views,
    transform: {
      offset: { x: 0, y: 0 },
      zoom: 1,
    },
  })
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

    const activeView = React.useMemo(
      () => EFPViews.find((v) => v.id == props.activeData.activeView),
      [props.activeData.activeView, ...EFPViews.map((v) => v.id)]
    )
    if (!activeView) throw new Error('active view does not exist')
    const { activeData, loading, loadingAmount, dispatch } = useViewData(
      activeView,
      props.geneticElement
    )
    if (!props.geneticElement) return <></>
    const efp = React.useMemo(
      () =>
        activeData ? (
          <activeView.component
            activeData={activeData}
            geneticElement={props.geneticElement}
            dispatch={dispatch}
          />
        ) : (
          <></>
        ),
      [activeView.id, props.geneticElement.id, dispatch, activeData]
    )
    const ref = React.useRef<HTMLDivElement>(null)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
        ref={ref}
      >
        <Box
          sx={(theme) => ({
            overflow: 'scroll',
          })}
        >
          <EFPListMemoized
            height={ref.current?.clientHeight ?? 300}
            activeView={activeView}
            dispatch={props.dispatch}
            geneticElement={props.geneticElement}
            views={EFPViews}
          />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          {loading || !activeData ? (
            <LinearProgress value={loadingAmount * 100} variant="determinate" />
          ) : (
            <PanZoom
              sx={{
                width: '100%',
                height: '100%',
              }}
              transform={props.activeData.transform}
              setTransform={(transform) => {
                props.dispatch((data) => ({
                  type: 'set-transform',
                  transform:
                    typeof transform == 'function'
                      ? transform(data.transform)
                      : transform,
                }))
              }}
            >
              {efp}
            </PanZoom>
          )}
        </Box>
      </Box>
    )
  }
  actions = [
    {
      action: { type: 'reset-transform' } as EFPViewerAction,
      render: () => <>Reset pan/zoom</>,
    },
  ]
}
