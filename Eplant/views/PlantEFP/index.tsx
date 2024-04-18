import React from 'react'

import ThumbnailDark from '../../../thumbnails/plant-efp-dark.png'
import ThumbnailLight from '../../../thumbnails/plant-efp-light.png'
import EFP from '../eFP'
import EFPViewer from '../eFP/Viewer'
import { EFPViewerData } from '../eFP/Viewer/types'
import { makeEfps } from '../eFP/Viewer/util'

import PlantEFPIcon from './icon'

const views: EFPViewerData['views'] = [
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
const efps: EFP[] = makeEfps(views)

export default new EFPViewer(
  'plant-efp',
  'Plant eFP',
  views,
  efps,
  () => <PlantEFPIcon />,
  'Visualize gene expression over time on a developmental map.',
  ThumbnailLight
)
