import { Forest } from '@mui/icons-material'
import React from 'react'
import EFP from '../eFP'
import EFPViewer from '../eFP/Viewer'
import PlantEFPIcon from './icon'
import Thumbnail from '../../../thumbnails/plant_efp.png'

export const cellEFP = new EFP(
  'cellEFP',
  'cellefp',
  'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.svg',
  'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.xml'
)

export default new EFPViewer(
  'cell',
  'Cell eFP',
  [
    {
      name: 'cellEFP',
      id: 'cellefp',
      svgURL:
      'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.svg',
      xmlURL:
      'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.xml',
    },
  ],
  () => <PlantEFPIcon />,
  'Visualize gene expression over time on a developmental map.',
  Thumbnail
)
