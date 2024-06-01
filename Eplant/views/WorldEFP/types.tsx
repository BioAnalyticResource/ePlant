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
  efpData: EFPData
  markerSVGString: string
}
