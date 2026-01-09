import { z } from 'zod'

import { EFPData } from '../eFP/types'

export type Coordinates = { lat: number; lng: number }

export const WorldEFPStateSchema = z.object({
  position: z.object({
    lat: z.number().default(25),
    lng: z.number().default(0),
  }),
  zoom: z.number().min(0).max(22).default(2),
  mapTypeId: z
    .enum(['roadmap', 'satellite', 'hybrid', 'terrain'])
    .default('roadmap'),
  maskModalVisible: z.boolean().default(false),
  maskingEnabled: z.boolean().default(false),
  maskThreshold: z.number().min(0).max(100).default(100),
  colorMode: z.enum(['absolute', 'relative']).default('absolute'),
})

export type WorldEFPState = z.infer<typeof WorldEFPStateSchema>

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
