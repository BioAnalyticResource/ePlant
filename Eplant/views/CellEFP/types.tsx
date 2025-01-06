import { z } from 'zod'

import { EFPData } from '@eplant/views/eFP/types'

export type CellEFPViewerData = {
  viewData: EFPData
}

export type EFPViewerSortTypes = 'expression-level' | 'name'

export type CellEFPSearchParams = {
  x: string
  y: string
  zoom: string
}

export const CellEFPStateSchema = z.object({
  transform: z.object({
    offset: z.object({
      x: z.number().default(0),
      y: z.number().default(0),
    }),
    zoom: z.number().min(0.25).max(4).default(1),
  }),
})

export type CellEFPViewerState = z.infer<typeof CellEFPStateSchema>
