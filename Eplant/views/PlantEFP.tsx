import EFP from './eFP'
import EFPViewer from './eFP/Viewer'

export const AtGenExpress = new EFP(
  'AtGen',
  'atgen',
  'https://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.svg',
  'https://bar.utoronto.ca/eplant/data/plant/AtGenExpress/Arabidopsis_thaliana.xml'
)

export default new EFPViewer('tissue', 'Tissue & Experiment EFP', [
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
])
