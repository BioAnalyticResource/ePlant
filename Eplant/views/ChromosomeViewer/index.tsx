import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Space } from 'react-zoomable-ui'

import GeneticElement from '@eplant/GeneticElement'
import { useGeneticElements } from '@eplant/state'
import Box from '@mui/material/Box'

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
import ZoomControls from './ZoomControls'

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
    useEffect(() => {
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
    useLayoutEffect(() => {
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
        {/* ZOOM CONTROLS */}
        <ZoomControls spaceRef={spaceRef} scale={state.transform.dZoom} />
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
              zoom: [0.05, 1000-0.3],
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
  actions: [],
  reducer: (state, action) => {
    switch (action.type) {
      case 'set-transform':
        return {
          ...state,
          transform: action.transform,
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
