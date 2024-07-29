import _, { max, mean } from 'lodash'

import GeneticElement from '@eplant/GeneticElement'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'

import { getEFPSampleData } from '../eFP'
import { EFPData, EFPGroup, EFPTissue } from '../eFP/types'

import MapContainer from './MapContainer'
import {
  Coordinates,
  WorldEFPData,
  WorldEFPGroupData,
  WorldEFPMicroArrayResponse,
  WorldEFPState,
} from './types'
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
    const microArrayDataURL =
      'https://bar.utoronto.ca/api_dev/microarray_gene_expression/world_efp/arabidopsis/At1g01010'
    const microArrayData: WorldEFPMicroArrayResponse = await fetch(
      microArrayDataURL
    )
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
    const groupData: WorldEFPGroupData[] = []

    Object.entries(microArrayData.data).forEach(([key, marker]) => {
      // Coordinates
      positions.push({
        lat: parseFloat(marker.position.lat),
        lng: parseFloat(marker.position.lng),
      })

      // Sample data
      const efpGroupData = {
        name: marker.id,
        id: key,
        mean: mean(Object.values(marker.values)),
      }

      groupData.push(efpGroupData)
    })

    const groupMax = groupData.reduce((extremum, group) => {
      return group.mean > extremum ? group.mean : extremum
    }, -Infinity)

    return {
      positions: positions,
      efpData: groupData,
      efpMax: groupMax,
    }
  },
  component({
    geneticElement,
    activeData,
    state,
  }: ViewProps<WorldEFPData, WorldEFPState, any>) {
    if (!geneticElement) return <></>
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
