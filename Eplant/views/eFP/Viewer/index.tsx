import GeneticElement from '@eplant/GeneticElement'
import PanZoom from '@eplant/util/PanZoom'
import { useViewData, View, ViewProps } from '@eplant/views/View'
import { Box, Drawer, LinearProgress } from '@mui/material'
import React from 'react'
import EFP from '..'
import EFPPreview from '../EFPPreview'
import { EFPViewerAction, EFPViewerData } from './types'

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
      [props.activeData.views]
    )
    console.log(EFPViews, props.activeData.activeView)
    const activeView = EFPViews.find((v) => v.id == props.activeData.activeView)
    if (!activeView) throw new Error('active view does not exist')

    const { activeData, loading, loadingAmount, dispatch } = useViewData(
      activeView,
      props.geneticElement
    )

    if (!props.geneticElement) return <></>
    console.log(props.activeData.transform)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          width: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={(theme) => ({
            overflow: 'scroll',
          })}
        >
          {EFPViews.map((view) => (
            <EFPPreview
              sx={(theme) => ({
                margin: theme.spacing(1),
              })}
              key={view.id}
              // Why is this an error? It is guarded by the above check.
              gene={props.geneticElement}
              selected={view.id == props.activeData.activeView}
              view={view}
              onClick={() => {
                props.dispatch({ type: 'set-view', id: view.id })
              }}
            />
          ))}
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
              <activeView.component
                activeData={activeData}
                geneticElement={props.geneticElement}
                dispatch={dispatch}
              />
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
