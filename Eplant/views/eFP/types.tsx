export type EFPId = string

export type EFPSampleData = {
  mean: number
  min: number
  max: number
  std: number
  samples: number
}

export type EFPTissue = { name: string; id: string } & EFPSampleData

export type EFPGroup = EFPSampleData & {
  name: string
  tissues: EFPTissue[]
  control?: number
}
export type EFPData = {
  renderAsThumbnail: boolean
  groups: EFPGroup[]
  control?: number
  colorMode: 'absolute' | 'relative'
}

export type EFPSVG = { svg: string; xml: string; id: EFPId }
export type EFPSVGCache = {
  [key: EFPId]: EFPSVG
}

export type EFPAction = never
