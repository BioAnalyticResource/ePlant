import { ColorMode, EFPData } from '../eFP/types'

export type Coordinates = { lat: number; lng: number }

type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain'

export type WorldEFPState = {
  position: Coordinates
  zoom: number
  mapTypeId: MapTypeId
  maskModalVisible: boolean
  maskingEnabled: boolean
  maskThreshold: number
  colorMode: ColorMode
}

export type WorldEFPData = {
  positions: Coordinates[]
  efpData: EFPData
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
export type WorldEFPAction =
  | { type: 'toggle-color-mode' }
  | { type: 'toggle-masking' }
  | { type: 'toggle-mask-modal' }
  | { type: 'set-mask-threshold'; threshold: number }
  | { type: 'set-map-position'; position: Coordinates }
  | { type: 'set-map-zoom'; zoom: number }
