import GeneticElement from '@eplant/GeneticElement'
import arabidopsis from '@eplant/Species/arabidopsis'
import ArabidopsisGeneInfoView from '@eplant/Species/arabidopsis/loaders/GeneInfoView'

const g: GeneticElement[] = [
  {
    id: 'AT1G01010',
    annotation: 'NAC domain containing protein 1',
    aliases: ['ANAC001', 'NAC001', 'NTL10'],
    species: arabidopsis,
    views: [ArabidopsisGeneInfoView],
  },
  {
    id: 'AT1G03020',
    annotation: 'Thioredoxin superfamily protein',
    aliases: ['GRXS1', 'ROXY16'],
    species: arabidopsis,
    views: [ArabidopsisGeneInfoView],
  },
  {
    id: 'AT3G24650',
    annotation: 'AP2/B3-like transcriptional factor family protein',
    aliases: ['ABI3', 'AtABI3', 'SIS10'],
    species: arabidopsis,
    views: [ArabidopsisGeneInfoView],
  },
  {
    id: 'AT5G20980',
    annotation: 'methionine synthase 3',
    aliases: ['ATMS3', 'MS3'],
    species: arabidopsis,
    views: [ArabidopsisGeneInfoView],
  },
  {
    id: 'AT5G60200',
    annotation: 'TARGET OF MONOPTEROS 6',
    aliases: ['DOF5.3', 'TMO6'],
    species: arabidopsis,
    views: [ArabidopsisGeneInfoView],
  },
]

export default g
