import { Transform } from '@eplant/util/PanZoom'
import { ColorMode, EFPData, EFPId } from '@eplant/views/eFP/types'
import EFP from '..'

export type EFPViewerData = {
  views: {
    svgURL: string
    xmlURL: string
    id: EFPId
    name: string
  }[]
  viewData: EFPData[]
  efps: EFP[]
}

export type EFPViewerSortTypes = 'expression-level' | 'name'

export type EFPViewerState = {
  activeView: EFPId
  transform: Transform
  colorMode: ColorMode
  sortBy: EFPViewerSortTypes
}

export type EFPViewerAction =
  | { type: 'set-view'; id: EFPId }
  | { type: 'reset-transform' }
  | { type: 'set-transform'; transform: Transform }
  | { type: 'toggle-color-mode' }
  | { type: 'sort-by'; by: EFPViewerSortTypes }
