import { Forest } from '@mui/icons-material'
import React from 'react'
import EFP from '../eFP'
import EFPViewer from '../eFP/Viewer'
import PlantEFPIcon from './icon'
import Thumbnail from '../../../thumbnails/plant_efp.png'
import { makeEfps } from '../eFP/efpFactory'
import { EFPViewerData } from '../eFP/Viewer/types'

const views: EFPViewerData['views'] = [
  {
    name: 'AtGenExpress',
    id: 'atgenexpress',
    svgURL:
      'https://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.svg',
    xmlURL:
      'https://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.xml',
  },
  {
    name: 'Klepikova',
    id: 'klepikova',
    svgURL:
      'https://bar.utoronto.ca/eplant/data/plant/Klepikova/Arabidopsis_thaliana.svg',
    xmlURL:
      'https://bar.utoronto.ca/eplant/data/plant/Klepikova/Arabidopsis_thaliana.xml',
  },
]
const efps: EFP[] = makeEfps(views);

export default new EFPViewer(
  'plant',
  'Plant eFP',
  views,
  efps,
  () => <PlantEFPIcon />,
  'Visualize gene expression over time on a developmental map.',
  Thumbnail
)
