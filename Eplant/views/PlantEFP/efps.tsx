import { EFPViewerData } from '../eFP/Viewer/types'
import { makeEfps } from '../eFP/Viewer/util'

export const plantEFPViews: EFPViewerData['views'] = [
  {
    name: 'AtGenExpress eFP',
    id: 'atgenexpress',
    svgURL:
      'https://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.svg',
    xmlURL:
      'https://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.xml',
  },
  {
    name: 'Klepikova eFP (RNA-Seq data)',
    id: 'klepikova',
    svgURL:
      'https://bar.utoronto.ca/eplant/data/plant/Klepikova/Arabidopsis_thaliana.svg',
    xmlURL:
      'https://bar.utoronto.ca/eplant/data/plant/Klepikova/Arabidopsis_thaliana.xml',
  },
]
export const plantEFPs = makeEfps(plantEFPViews)
