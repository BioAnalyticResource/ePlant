import { Forest } from '@mui/icons-material'
import React from 'react'
import EFP from '../eFP'
import EFPViewer from '../eFP/Viewer'
import PlantEFPIcon from './icon'
import Thumbnail from '../../../thumbnails/plant_efp.png'

export const AtGenExpress = new EFP(
  'AtGen',
  'atgen',
  'http://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.svg',
  'http://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.xml'
)

export default new EFPViewer(
  'plant',
  'Plant eFP',
  [
    {
      name: 'AtGenExpress',
      id: 'atgenexpress',
      svgURL:
        'http://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.xml',
    },
    {
      name: 'Klepikova',
      id: 'klepikova',
      svgURL:
        'http://bar.utoronto.ca/eplant/data/plant/Klepikova/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/plant/Klepikova/Arabidopsis_thaliana.xml',
    },
  ],
  () => <PlantEFPIcon />,
  'Visualize gene expression over time on a developmental map.',
  Thumbnail
)
