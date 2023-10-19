import { Forest } from '@mui/icons-material'
import React from 'react'
import EFP from '../eFP'
import EFPViewer from '../eFP/Viewer'
import PlantEFPIcon from './icon'
import Thumbnail from '../../../thumbnails/plant_efp.png'
import { EFPViewerData } from '../eFP/Viewer/types'
import { cellEfpFactory, efpFactory } from '../eFP/efpFactory'


const views: EFPViewerData['views'] = [
  {
      name: 'cellEFP',
      id: 'cellefp',
      svgURL:
      'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.svg',
      xmlURL:
      'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.xml',
    }
]
const efps: EFP[] = cellEfpFactory(views);

export default new EFPViewer(
  'cell',
  'Cell eFP',
  views,
  efps,
  () => <PlantEFPIcon />,
  'Visualize gene expression over time on a developmental map.',
  Thumbnail
)
