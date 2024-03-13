import { Transform } from '@eplant/util/PanZoom'
import { ColorMode, EFPData, EFPId } from '@eplant/views/eFP/types'

export type EFPViewerData = {
  viewData: EFPData
}

export type EFPViewerSortTypes = 'expression-level' | 'name'

export type EFPViewerState = {
  activeView: EFPId
  transform: Transform
  colorMode: ColorMode
  sortBy: EFPViewerSortTypes
  maskModalVisible: boolean
  maskThreshold: number
}

export type EFPViewerAction =
  | { type: 'set-view'; id: EFPId }
  | { type: 'reset-transform' }
  | { type: 'set-transform'; transform: Transform }
  | { type: 'toggle-color-mode' }
  | { type: 'sort-by'; by: EFPViewerSortTypes }
  | { type: 'toggle-mask-modal' }
  | { type: 'set-mask-threshold'; threshold: number }
