import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { ViewDataError } from '@eplant/View'
import { useQuery } from '@tanstack/react-query'
import { APIProvider } from '@vis.gl/react-google-maps'

import { EFPData, EFPGroup } from '../eFP/types'
import MaskModal from '../eFP/Viewer/MaskModal'

import MapContainer from './MapContainer'
import {
  Coordinates,
  WorldEFPAction,
  WorldEFPData,
  WorldEFPMicroArrayResponse,
  WorldEFPState,
  WorldEFPStateSchema,
} from './types'
import WorldEFP from '.'

export const WorldEFPView = () => {
  const { geneticElement } = useOutletContext<ViewContext>()
  const { state, setState, initializeState } = useURLState<WorldEFPState>()
  const [loadAmount, setLoadAmount] = useState(0)

  const { data, isLoading, isError, error } = useQuery<
    WorldEFPData,
    ViewDataError
  >({
    queryKey: [`world-efp-${geneticElement?.id}`],
    queryFn: async () => {
      return worldEFPLoader(geneticElement, setLoadAmount)
    },
  })
  useEffect(() => {
    // On mount, initialize state
    initializeState(WorldEFPStateSchema)
  }, [])

  if (!geneticElement) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={WorldEFP}
        error={ViewDataError.UNSUPPORTED_GENE}
      ></LoadingPage>
    )
  } else if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={WorldEFP}
        error={error}
      ></LoadingPage>
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={WorldEFP}
        error={null}
      ></LoadingPage>
    )
  } else if (!data || !state) return <></>

  return (
    <>
      <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY} version='beta'>
        <MapContainer activeData={data} state={state} setState={setState} />
      </APIProvider>
      <MaskModal
        isVisible={state.maskModalVisible}
        threshold={state.maskThreshold}
        onClose={() => {
          setState({ ...state, maskModalVisible: !state.maskModalVisible })
        }}
        onSubmit={(threshold) => {
          setState({
            ...state,
            maskThreshold: threshold,
            maskingEnabled: !state.maskingEnabled,
            maskModalVisible: !state.maskModalVisible,
          })
        }}
      />
    </>
  )
}

export const worldEFPLoader = async (
  geneticElement: GeneticElement | null,
  loadEvent: (loaded: number) => void
) => {
  if (!geneticElement) throw ViewDataError.UNSUPPORTED_GENE

  const microArrayDataURL = `https://bar.utoronto.ca/api_dev/microarray_gene_expression/world_efp/arabidopsis/${geneticElement.id}`
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
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length
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

  const totalSamples = groupData.reduce((sum, group) => sum + group.samples, 0)
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
}
