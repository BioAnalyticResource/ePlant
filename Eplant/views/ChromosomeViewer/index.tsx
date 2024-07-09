import React, { useState } from 'react'
import { transform } from 'lodash'
//@ts-ignore
import { MapInteractionCSS } from 'react-map-interaction'

import GeneticElement from '@eplant/GeneticElement'
import { useGeneticElements } from '@eplant/state'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import IconButton from '@mui/material/IconButton'
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
      value: {
        scale: 0.8,
        translation: {
          x: 0,
          y: 0,
        },
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
    chromosomeViewData = await fetch(url)
      .then(async (response) => {
        return response.json()
      })
      .then((responseObj: ChromosomesResponseObj) => responseObj['chromosomes'])

    return {
      viewData: chromosomeViewData,
      value: {
        scale: 0.8,
        translation: { x: 0, y: 0 },
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
    const [geneticElements] = useGeneticElements()

    const chromosomes = [
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
      {
        id: 'Chr2',
        name: 'Chr 2',
        size: 19698289,
        centromeres: [
          {
            id: 'CEN2',
            start: 3607930,
            end: 3608929,
          },
        ],
      },
      {
        id: 'Chr3',
        name: 'Chr 3',
        size: 23459830,
        centromeres: [
          {
            id: 'CEN3_1',
            start: 13587787,
            end: 13588786,
          },
          {
            id: 'CEN3_2',
            start: 13799418,
            end: 13800417,
          },
          {
            id: 'CEN3_3',
            start: 14208953,
            end: 14209952,
          },
        ],
      },
      {
        id: 'Chr4',
        name: 'Chr 4',
        size: 18585056,
        centromeres: [
          {
            id: 'CEN4',
            start: 3956022,
            end: 3957021,
          },
        ],
      },
      {
        id: 'Chr5',
        name: 'Chr 5',
        size: 26975502,
        centromeres: [
          {
            id: 'CEN5',
            start: 11725025,
            end: 11726024,
          },
        ],
      },
      {
        id: 'ChrC',
        name: 'Chr C',
        size: 154478,
        centromeres: [],
      },
      {
        id: 'ChrM',
        name: 'Chr M',
        size: 366924,
        centromeres: [],
      },
    ]

    // On active geneticElement update
    React.useEffect(() => {
      if (geneticElement != null) {
        fetch(
          `https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=${geneticElement.id}`
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
          `https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=${gene.id}`
        )
          .then((response) => response.json())
          .then((geneItem) => {
            const genePixelLoc: number =
              ((geneItem?.start + geneItem.end) / 2) * 0.000015
            const geneAnnotation: GeneAnnotationItem = {
              id: geneItem.id,
              chromosome: geneItem.chromosome,
              location: genePixelLoc,
              strand: geneItem.strand,
            } // geneAnnotation is an object that holds only the neccessary information to draw the gene indicators
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

    // React Nodes
    const controlButton = (variant: string) => {
      return (
        <React.Fragment>
          <IconButton aria-label='fingerprint' color='secondary'>
            {variant === '+' ? <Add /> : variant === '-' ? <Remove /> : <></>}
          </IconButton>
        </React.Fragment>
      )
    }
    return (
      <>
        <Typography variant='h6' sx={{}}>
          Chromosome Viewer
        </Typography>
        <MapInteractionCSS
          showControls
          defaultValue={{
            scale: 0.8,
            translation: { x: 100, y: 0 },
          }}
          value={state.value}
          onChange={(value: Transform) => {
            dispatch({
              type: 'set-transform',
              value,
            })
          }}
          minScale={0.25}
          maxScale={100}
          translationBounds={{
            xMax: 400,
            yMax: 0,
          }}
          btnClass={'ChromosomeZoomBtn'}
          plusBtnContents={controlButton('+')}
          minusBtnContents={controlButton('-')}
        >
          <ChromosomeView
            chromosomes={activeData.viewData}
            activeGeneAnnotation={activeGeneAnnotation}
            geneAnnotationArray={geneAnnotationArray}
            scale={state.value.scale}
          ></ChromosomeView>
        </MapInteractionCSS>
      </>
    )
  },
  actions: [
    {
      action: { type: 'reset-transform' },
      render: () => <>Reset pan/zoom</>,
    },
  ],
  reducer: (state, action) => {
    switch (action.type) {
      case 'set-transform':
        return {
          ...state,
          value: action.value,
        }
      case 'reset-transform':
        return {
          ...state,
          value: {
            scale: 0.8,
            translation: { x: 100, y: 0 },
          },
        }
      default:
        return state
    }
  },
  icon: () => <ChromosomeIcon />,
  description: 'Chromosome Viewer.',
  citation() {
    return <div></div>
  },
}
export default ChromosomeViewer
