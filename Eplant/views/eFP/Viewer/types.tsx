import { Transform } from '@eplant/util/PanZoom'
import { EFPData, EFPId } from '@eplant/views/eFP/types'

export type EFPViewerData = {
  activeView: EFPId
  views: {
    svgURL: string
    xmlURL: string
    id: EFPId
    name: string
  }[]
  viewData: EFPData[]
  transform: Transform
  colorMode: 'absolute' | 'relative'
}
export type EFPViewerAction =
  | { type: 'set-view'; id: EFPId }
  | { type: 'reset-transform' }
  | { type: 'set-transform'; transform: Transform }
  | { type: 'toggle-color-mode' }
