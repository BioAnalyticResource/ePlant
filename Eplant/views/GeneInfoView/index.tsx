import * as React from 'react'
import { z } from 'zod'
import { View, ViewProps } from '../View'

export const GeneInfoViewData = z.object({
  locus: z.string(),
  synonyms: z.string().array(),
  name: z.string(),
  brief_description: z.string(),
  computational_description: z.string(),
  curator_summary: z.string(),
  location: z.string(),
  chromosome_start: z.number(),
  chromosome_end: z.number(),
  strand: z.string(),
})
export type GeneInfoViewData = z.infer<typeof GeneInfoViewData>

export const GeneInfoView = {
  name: 'Gene Info Viewer',
  dataType: GeneInfoViewData,
  component(props: ViewProps) {
    return <div></div>
  },
}
