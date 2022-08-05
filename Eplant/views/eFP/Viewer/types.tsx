import { EFPId } from '@eplant/views/eFP/types'

export type EFPViewerData = {
  activeView: EFPId
  views: {
    svgURL: string
    xmlURL: string
    id: EFPId
    name: string
  }[]
}
export type EFPViewerAction = { type: 'set-view'; id: EFPId }
