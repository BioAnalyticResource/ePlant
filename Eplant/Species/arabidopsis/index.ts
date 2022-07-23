import { GeneInfoView, GeneInfoViewData } from '@eplant/views/GeneInfoView'
import GeneInfoViewLoader from './loaders/GeneInfoView'
import axios from 'axios'
import Species, { SpeciesApi } from '../'
import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/views/View'
import ArabidopsisGeneInfoView from './loaders/GeneInfoView'
import ArabidopsisPublicationViewer from './loaders/PublicationViewer'
const arabidopsis: Species = new Species('Arabidopsis', {
  autocomplete,
  searchGene,
  loaders: {
    'gene-info': GeneInfoViewLoader,
    'publication-viewer': ArabidopsisPublicationViewer,
  },
})
async function autocomplete(s: string) {
  return (
    await axios.get(
      'http://bar.utoronto.ca/eplant/cgi-bin/idautocomplete.cgi?species=Arabidopsis_thaliana&term=' +
        s
    )
  ).data
}

async function searchGene(s: string) {
  const data = (
    await axios.get(
      'http://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=' +
        s
    )
  ).data
  if (!data.id || !data.annotation || !data.aliases) return null
  const gene = new GeneticElement(
    data.id,
    data.annotation,
    arabidopsis,
    data.aliases
  )
  return gene
}

export default arabidopsis
