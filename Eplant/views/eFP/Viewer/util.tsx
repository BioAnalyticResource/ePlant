import EFP from '..'

import { EFPViewerData } from './types'

export function makeEfps(views: EFPViewerData['views']) {
  return views.map((view) => {
    return new EFP(view.name, view.id, view.svgURL, view.xmlURL)
  })
}
