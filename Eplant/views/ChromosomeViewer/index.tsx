import React, { useState } from 'react'
import { Space } from 'react-zoomable-ui'

import GeneticElement from '@eplant/GeneticElement'
import { useGeneticElements } from '@eplant/state'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import { View, ViewProps } from '../../View'

import ChromosomeView from './Viewer/Viewer'
import { ChromosomeIcon } from './icons'
import {
  ChromosomeList,
  ChromosomesResponseObj,
  ChromosomeViewerAction,
  ChromosomeViewerData,
  ChromosomeViewerState,
  GeneAnnotationItem,
  GeneItem,
  Transform,
} from './types'

const ChromosomeViewer: View<
  ChromosomeViewerData,
  ChromosomeViewerState,
  ChromosomeViewerAction
> = {
  name: 'Chromosome Viewer',
  id: 'chromosome-viewer',
  getInitialState(): ChromosomeViewerState {
    return {
      transform: {
        dx: 300,
        dy: 150,
        dZoom: 0.7,
      },
    }
  },

  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    let chromosomeViewData: ChromosomeList = [
      {
        id: 'Chr1',
        name: 'Chr 1',
        size: 30427671,
        centromeres: [
          {
            id: 'CEN1',
            start: 15086046,
            end: 15087045,
          },
        ],
      },
    ]

    const species = 'Arabidopsis_thaliana'
    const url = `https://bar.utoronto.ca/eplant/cgi-bin/chromosomeinfo.cgi?species=${species}`

    // const species = 'Populus_trichocarpa'
    // const url = `https://bar.utoronto.ca/eplant_poplar/cgi-bin/chromosomeinfo.cgi?species=${species}`
    chromosomeViewData = await fetch(url)
      .then(async (response) => {
        return response.json()
      })
      .then((responseObj: ChromosomesResponseObj) => responseObj['chromosomes'])

    return {
      viewData: chromosomeViewData,
      transform: {
        dx: 0,
        dy: 0,
        dZoom: 1,
      },
    }
  },
  component({
    activeData,
    state,
    dispatch,
    geneticElement,
  }: ViewProps<
    ChromosomeViewerData,
    ChromosomeViewerState,
    ChromosomeViewerAction
  >) {
    const [activeGeneAnnotation, setActiveGeneAnnotation] =
      useState<GeneAnnotationItem | null>(null)
    const [geneAnnotationArray, setGeneAnnotationArray] = useState<
      GeneAnnotationItem[] | []
    >([])
    const spaceRef = React.useRef<Space | null>(null)
    const [geneticElements] = useGeneticElements()

    // On active geneticElement update
    React.useEffect(() => {
      if (geneticElement != null) {
        fetch(
          // Arabidopsis_thaliana
          `https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=${geneticElement.id}`
          // Populus_trichocarpa
          // `https://bar.utoronto.ca/eplant_poplar/cgi-bin/querygene.cgi?species=Populus_trichocarpa&term=${geneticElement.id}`
        )
          .then((response) => response.json())
          .then((geneItem) => {
            setActiveGeneAnnotation(getGeneAnnotation(geneItem))
          })
      }
    }, [geneticElement])

    //on geneticElements in sidebar update
    React.useEffect(() => {
      setGeneAnnotationArray([])
      geneticElements.map((gene) => {
        fetch(
          // Arabidopsis_thaliana
          `https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=${gene.id}`
          // Populus_trichocarpa
          // `https://bar.utoronto.ca/eplant_poplar/cgi-bin/querygene.cgi?species=Populus_trichocarpa&term=${gene.id}`
        )
          .then((response) => response.json())
          .then((geneItem) => {
            const geneAnnotation: GeneAnnotationItem =
              getGeneAnnotation(geneItem)
            const tempGenes: GeneAnnotationItem[] = geneAnnotationArray
            tempGenes.push(geneAnnotation)
            setGeneAnnotationArray(tempGenes)
          })
          .catch((err) => {
            console.log(err)
          })
      })
    }, [geneticElements])

    // Utility Functions
    const getGeneAnnotation = (gene: GeneItem): GeneAnnotationItem => {
      const genePixelLoc: number = ((gene.start + gene.end) / 2) * 0.000015
      const geneAnnotation: GeneAnnotationItem = {
        id: gene.id,
        chromosome: gene.chromosome,
        location: genePixelLoc,
        strand: gene.strand,
      }
      return geneAnnotation
    }

    return (
      <Box sx={{ flexGrow: 1 }}>
        {/* VIEW TOOLBAR */}
        <AppBar position='sticky' color='default' sx={{ overflow: 'overlay' }}>
          <Toolbar variant='dense'>
            {/* VIEW TITLE */}
            <Typography variant='h6' sx={{ flexGrow: 1 }}>
              Chromosome Viewer
            </Typography>
            {/* ZOOM CONTROLS */}
            <Typography
              variant='caption'
              sx={{
                color:
                  state.transform.dZoom == 1000
                    ? 'red'
                    : state.transform.dZoom < 0.46
                      ? 'red'
                      : 'white',
              }}
            >
              {(state.transform.dZoom * 100).toFixed(0)}%
            </Typography>
            <ButtonGroup variant='outlined' sx={{ marginLeft: '5px' }}>
              <Button
                size='medium'
                color='secondary'
                title='Zoom in'
                sx={{
                  minWidth: '25px',
                  padding: '2px',
                }}
                onClick={() =>
                  spaceRef.current?.viewPort?.camera.moveBy(0, 0, 0.1)
                }
              >
                <Add />
              </Button>
              <Button
                size='medium'
                color='secondary'
                title='Zoom out'
                sx={{
                  minWidth: '25px',
                  padding: '2px',
                }}
                onClick={() =>
                  spaceRef.current?.viewPort?.camera.moveBy(0, 0, -0.1)
                }
              >
                <Remove />
              </Button>
            </ButtonGroup>
            <Button
              color='secondary'
              title='Reset zoom'
              onClick={() =>
                spaceRef.current?.viewPort?.camera.recenter(300, 150, 0.7)
              }
            >
              Reset
            </Button>
          </Toolbar>
        </AppBar>
        {/* CHROMOSOME VIEWER */}
        <Space
          ref={spaceRef}
          onCreate={(vp) => {
            vp.camera.recenter(
              state.transform.dx,
              state.transform.dy,
              state.transform.dZoom
            )
            vp.setBounds({
              x: [-650, 1300],
              y: [-450, 815],
              zoom: [0.05, 1000],
            })
          }}
          onUpdated={(vp) => {
            const transform: Transform = {
              dx: vp.centerX,
              dy: vp.centerY,
              dZoom: vp.zoomFactor,
            }
            dispatch({
              type: 'set-transform',
              transform,
            })
          }}
        >
          <ChromosomeView
            chromosomes={activeData.viewData}
            activeGeneAnnotation={activeGeneAnnotation}
            geneAnnotationArray={geneAnnotationArray}
            scale={state.transform.dZoom}
          ></ChromosomeView>
        </Space>
      </Box>
    )
  },
  actions: [
    {
      action: { type: 'toggle-heatmap' },
      render: () => <>Toggle heatmap</>,
    },
  ],
  reducer: (state, action) => {
    switch (action.type) {
      case 'set-transform':
        return {
          ...state,
          transform: action.transform,
        }
      case 'toggle-heatmap':
        return {
          ...state,
        }
      default:
        return state
    }
  },
  icon: () => <ChromosomeIcon />,
  description: 'Chromosome Viewer.',
  citation() {
    return (
      <div>
        This image was generated with the Chromosome viewer of ePlant v3 using
        the BAR api
      </div>
    )
  },
}
export default ChromosomeViewer
