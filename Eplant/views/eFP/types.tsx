export type EFPId = string

export type EFPData = {
  groups: {
    name: string
    tissues: { name: string; id: string; value: number }[]
    control: number
  }[]
}

export type EFPSVG = { svg: string; xml: string; id: EFPId }
export type EFPSVGCache = {
  [key: EFPId]: EFPSVG
}

export type EFPAction = never
