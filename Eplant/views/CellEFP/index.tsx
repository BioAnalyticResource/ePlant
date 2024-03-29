import Thumbnail from '../../../thumbnails/plant_efp.png'
import EFP from '../eFP'
import EFPViewer from '../eFP/Viewer'
import { EFPViewerData } from '../eFP/Viewer/types'
import { makeCellEfps } from '../eFP/Viewer/util'

import CellEFPIcon from './icon'

const views: EFPViewerData['views'] = [
  {
    name: 'Cell eFP',
    id: 'cellefp',
    svgURL: 'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.svg',
    xmlURL: 'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.xml',
  },
]
const efps: EFP[] = makeCellEfps(views)

export default new EFPViewer(
  'cell',
  'Cell eFP',
  views,
  efps,
  () => <CellEFPIcon />,
  'Visualize gene expression over time on a developmental map.',
  Thumbnail
)
