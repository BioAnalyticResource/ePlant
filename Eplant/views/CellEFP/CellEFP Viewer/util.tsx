import CellEFP from '../../CellEFP/cellEFP'
import EFP from '../../eFP'

import { EFPViewerData } from './types'

export function makeEfps(views: EFPViewerData['views']) {
  return views.map((view) => {
    return new EFP(view.name, view.id, view.svgURL, view.xmlURL)
  })
}

export function makeCellEfps(views: EFPViewerData['views']) {
  return views.map((view) => {
    return new CellEFP(view.name, view.id, view.svgURL, view.xmlURL)
  })
}
