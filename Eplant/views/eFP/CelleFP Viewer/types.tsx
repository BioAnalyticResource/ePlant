import { Transform } from '@eplant/util/PanZoom'
import { ColorMode, EFPData, EFPId } from '@eplant/views/eFP/types'

export type CellEFPViewerData = {
  views: {
    svgURL: string
    xmlURL: string
    id: EFPId
    name: string
  }[]
  viewData: EFPData[]
}

export type EFPViewerSortTypes = 'expression-level' | 'name'

export type CellEFPViewerState = {
  transform: Transform
}

export type CellEFPViewerAction =
  | { type: 'reset-transform' }
  | { type: 'set-transform'; transform: Transform }
