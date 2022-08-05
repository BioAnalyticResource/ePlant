export type EFPId = string

export type EFPData = {
  groups: {
    name: string
    tissues: { name: string; id: string; value: number }[]
    control: number
    min: number
    max: number
    mean: number
    std: number
  }[]
  renderAsThumbnail: boolean
}

export type EFPSVG = { svg: string; xml: string; id: EFPId }
export type EFPSVGCache = {
  [key: EFPId]: EFPSVG
}

export type EFPAction = never
