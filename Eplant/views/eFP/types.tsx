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
export type EFPData = EFPSampleData & {
  groups: EFPGroup[]
  control?: number
  supported: boolean
}

export type ColorMode = 'absolute' | 'relative'
export type EFPState = {
  colorMode: 'absolute' | 'relative'
  renderAsThumbnail: boolean
  maskThreshold: number
  maskingEnabled: boolean
}

export type EFPSVG = { svg: string; xml: string; id: EFPId }
export type EFPSVGCache = {
  [key: EFPId]: EFPSVG
}

export type EFPAction = never
