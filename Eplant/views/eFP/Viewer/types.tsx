import { Transform } from '@eplant/util/PanZoom'
import { ColorMode, EFPData, EFPId } from '@eplant/views/eFP/types'

export type EFPViewerData = {
  views: {
    svgURL: string
    xmlURL: string
    id: EFPId
    name: string
  }[]
  viewData: EFPData[]
}

export type EFPViewerState = {
  activeView: EFPId
  transform: Transform
  colorMode: ColorMode
}

export type EFPViewerAction =
  | { type: 'set-view'; id: EFPId }
  | { type: 'reset-transform' }
  | { type: 'set-transform'; transform: Transform }
  | { type: 'toggle-color-mode' }
