import GeneticElement from '@eplant/GeneticElement'
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
  })
  reducer = (state: EFPViewerData, action: EFPViewerAction) => {
    switch (action.type) {
      case 'set-view':
        return {
          ...state,
          activeView: action.id,
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

    const { activeData, loading, loadingAmount } = useViewData(
      activeView,
      props.geneticElement
    )

    if (!props.geneticElement) return <></>
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
        <Box>
          {EFPViews.map((view) => (
            <EFPPreview
              key={view.id}
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
            <activeView.component
              activeData={activeData}
              geneticElement={props.geneticElement}
            />
          )}
        </Box>
      </Box>
    )
  }
}
