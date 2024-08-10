import { useEffect, useMemo, useRef, useState } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import NotSupported from '@eplant/UI/Layout/ViewNotSupported'
import { getCitation } from '@eplant/util/citations'
import PanZoom from '@eplant/util/PanZoom'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'
import { Box, Typography } from '@mui/material'

import EFPViewerCitation from '../eFP/Viewer/EFPViewerCitation'
import Legend from '../eFP/Viewer/legend'

import { CellEFPDataObject } from './CellEFPDataObject'
import CellEFPIcon from './icon'
import {
  CellEFPViewerAction,
  CellEFPViewerData,
  CellEFPViewerState,
} from './types'

const CellEFP: View<
  CellEFPViewerData,
  CellEFPViewerState,
  CellEFPViewerAction
> = {
  id: 'Cell eFP',
  name: 'Cell eFP',
  icon: () => <CellEFPIcon />,
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

    let totalLoaded = 0
    const viewData = await CellEFPDataObject.getInitialData(
      gene,
      (progress) => {
        totalLoaded += progress
        loadEvent(totalLoaded)
      }
    )
    return {
      activeView: CellEFP.id,
      transform: {
        offset: { x: 0, y: 0 },
        zoom: 1,
      },
      viewData: viewData,
    }
  },
  reducer(state: CellEFPViewerState, action: CellEFPViewerAction) {
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
  component({
    activeData,
    state,
    dispatch,
    geneticElement,
  }: ViewProps<CellEFPViewerData, CellEFPViewerState, CellEFPViewerAction>) {
    const efp = useMemo(() => {
      const Component = CellEFPDataObject.component
      return <Component data={activeData} geneticElement={geneticElement} />
    }, [geneticElement?.id])
    if (!geneticElement) return <></>
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <Typography variant='h6'>
          {CellEFP.name}
          {': '}
          {geneticElement?.id}
        </Typography>
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
            {activeData.viewData.supported ? (
              <>
                <Legend
                  sx={(theme) => ({
                    position: 'absolute',
                    left: theme.spacing(2),
                    bottom: theme.spacing(2),
                    zIndex: 10,
                  })}
                  data={{
                    ...activeData.viewData,
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
                  view={CellEFP}
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
        cell efp
        {': '}
        {props.geneticElement?.id}
      </Typography>
    )
  },

  citation() {
    const [xmlData, setXMLData] = useState<string[]>([])

    const viewID = CellEFP.name
    const viewXML = CellEFPDataObject.xmlURL
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
    })

    const citation = getCitation(viewID) as { [key: string]: string }
    return (
      <EFPViewerCitation
        viewID={viewID}
        citation={citation}
        xmlData={xmlData}
      ></EFPViewerCitation>
    )
  },
}

export default CellEFP
