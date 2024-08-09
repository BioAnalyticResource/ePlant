import GeneticElement from '@eplant/GeneticElement'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'

import { EFPData, EFPGroup } from '../eFP/types'

import WorldEFPIcon from './icon'
import MapContainer from './MapContainer'
import {
  Coordinates,
  WorldEFPData,
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
    const microArrayDataURL = `https://bar.utoronto.ca/api_dev/microarray_gene_expression/world_efp/arabidopsis/${gene.id}`
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
    const groupData: EFPGroup[] = []
    Object.entries(microArrayData.data).forEach(([key, marker]) => {
      // Coordinates
      positions.push({
        lat: parseFloat(marker.position.lat),
        lng: parseFloat(marker.position.lng),
      })
      const samples = Object.values(marker.values)
      // Sample data
      const mean =
        samples.reduce((sum, value) => sum + value, 0) / samples.length
      const efpGroupData = {
        name: marker.id,
        tissues: [],
        mean: mean,
        min: Math.min(...samples),
        max: Math.max(...samples),
        std: Math.sqrt(
          samples.reduce((sum, value) => Math.pow(value - mean, 2)) /
            (samples.length - 1)
        ),
        samples: samples.length,
      }

      groupData.push(efpGroupData)
    })

    const totalSamples = groupData.reduce(
      (sum, group) => sum + group.samples,
      0
    )
    const totalMean =
      groupData.reduce((sum, group) => sum + group.mean * group.samples, 0) /
      totalSamples

    const efpData = {
      groups: groupData,
      mean: totalMean,
      min: Math.min(...groupData.map((group) => group.min)),
      max: Math.max(...groupData.map((group) => group.max)),
      std: 0, // This isn't needed, just set to 0 for convenience
      samples: totalSamples,
    } as EFPData

    return {
      positions: positions,
      efpData: efpData,
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
  icon: () => <WorldEFPIcon></WorldEFPIcon>,
  description: '',
  // TODO: If dark theme is active, use ThumbnailDark
  citation({ gene }) {
    return <div></div>
  },
}
export default WorldEFP
