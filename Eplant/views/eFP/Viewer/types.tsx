import { z } from 'zod'

import GeneticElement from '@eplant/GeneticElement'
import { Transform } from '@eplant/util/PanZoom'
import { EFPData, EFPId } from '@eplant/views/eFP/types'

import EFP from '..'

export type EFPViewerData = {
  views: {
    svgURL: string
    xmlURL: string
    id: EFPId
    name: string
  }[]
  viewData: EFPData[]
}

export type EFPViewerSortTypes = 'expression-level' | 'name'

const transformSchema = z.object({
  offset: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
  }),
  zoom: z.number().min(0.25).max(4).default(1),
})

export const EFPViewerStateSchema = z.object({
  activeView: z.string().default(''),
  colorMode: z.enum(['absolute', 'relative']).default('absolute'),
  transform: transformSchema,
  sortBy: z.enum(['name', 'expression-level']).default('name'),
  maskingEnabled: z.boolean().default(false),
  maskThreshold: z.number().default(100),
  maskModalVisible: z.boolean().default(false),
})

export type EFPViewerState = z.infer<typeof EFPViewerStateSchema>
export type EFPListProps = {
  geneticElement: GeneticElement
  views: EFP[]
  viewData: EFPData[]
  activeView: EFP
  setActiveView: (viewID: EFPId) => void
  height: number
  colorMode: 'absolute' | 'relative'
  maskThreshold: number
  maskingEnabled: boolean
  transform: Transform
}
