import _ from 'lodash'

import GeneticElement from '@eplant/GeneticElement'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'

import { getEFPSampleData } from '../eFP'
import { EFPData, EFPGroup, EFPTissue } from '../eFP/types'

import MapContainer from './MapContainer'
import { Coordinates, WorldEFPData, WorldEFPState } from './types'
const WorldEFP: View<WorldEFPData, WorldEFPState, any> = {
  name: 'World-EFP',
  id: 'World-EFP',
  getInitialState() {
    return {
      position: { lat: 25, lng: 0 },
      zoom: 2,
      mapTypeId: 'roadmap',
      maskingEnabled: false,
      maskModalVisibile: false,
      maskingThreshold: 100,
      colorMode: 'absolute',
    }
  },
  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    if (!gene) throw ViewDataError.UNSUPPORTED_GENE
    const markersURL =
      'https://private-1e099f-eplant3.apiary-mock.com/microarray_gene_expression/world_efp/At1g01010'
    const markerData = await fetch(markersURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .catch((error) => {
        console.error('Error fetching map marker data:', error)
        throw error
      })

    const positions: Coordinates[] = []
    const groupData: EFPGroup[] = []
    markerData.foreach(
      (group: {
        id: string
        source: string
        position: { lat: string; lng: string }
        samples: [string, number][]
        ctrlSamples: [string, number][]
      }) => {
        const samples = group.samples.map((v) => v[1])
        const ctrls = group.ctrlSamples.map((v) => v[1])
        const sampleTissue = {
          name: group.id,
          id: group.id,
          ...getEFPSampleData(samples),
        } as EFPTissue
        const tissueValue = sampleTissue.mean
        const ctrlValue = _.mean(ctrls)
        groupData.push({
          name: group.id,
          control: Number.isFinite(ctrlValue) ? ctrlValue : undefined,
          tissues: [sampleTissue],
          ...getEFPSampleData([tissueValue]),
        })
      }
    )

    const efpData: EFPData = {
      groups: groupData,
      control: _.mean(
        groupData
          .map((g) => g.control)
          .filter((g: unknown) => Number.isFinite(g))
      ),
      min: Math.min(...groupData.map((g: { min: any }) => g.min)),
      max: Math.max(...groupData.map((g: { max: any }) => g.max)),
      mean: _.mean(groupData.map((g: { mean: any }) => g.mean)),
      std:
        _.sum(
          groupData.map(
            (g: { std: number; samples: number }) => g.std ** 2 * g.samples
          )
        ) / _.sum(groupData.map((g: { samples: any }) => g.samples)),
      samples: _.sum(groupData.map((g: { samples: any }) => g.samples)),
      supported:
        Number.isFinite(_.mean(groupData.map((g: { mean: any }) => g.mean))) &&
        groupData.length > 0,
    }
    return {
      positions: positions,
      efpData: efpData,
      markerSVGString: 'dummy_string',
    }
  },
  component({
    geneticElement,
    activeData,
    state,
  }: ViewProps<WorldEFPData, WorldEFPState, any>) {
    if (!geneticElement) return <></>
    else
      return <MapContainer activeData={activeData} state={state}></MapContainer>
  },
  icon: () => <div></div>,
  description: 'Find publications that mention your gene of interest.',
  // TODO: If dark theme is active, use ThumbnailDark
  citation({ gene }) {
    return <div></div>
  },
}
export default WorldEFP
