import { ColorMode, EFPData } from '../eFP/types'

export type Coordinates = { lat: number; lng: number }

type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain'

export type WorldEFPState = {
  position: Coordinates
  zoom: number
  mapTypeId: MapTypeId
  maskModalVisibile: boolean
  maskingEnabled: boolean
  maskingThreshold: number
  colorMode: ColorMode
}

export type WorldEFPData = {
  positions: Coordinates[]
  efpData: WorldEFPGroupData[]
  efpMax: number
}

export interface WorldEFPMicroArrayResponse {
  wasSuccessful: boolean
  data: { [key: string]: WorldEFPMicroArrayData }
}

export interface WorldEFPMicroArrayData {
  source: string
  id: string
  samples: string[]
  ctrlSamples: string[]
  position: { lat: string; lng: string }
  probeset: string
  values: { [key: string]: number }
  code: string
}

export interface WorldEFPGroupData {
  name: string
  id: string
  mean: number
  std: number
  sampleSize: number
}
