import { GeneInfoView, GeneInfoViewData } from '@eplant/views/GeneInfoView'
import GeneInfoViewLoader from './loaders/GeneInfoView'
import axios from 'axios'
import Species, { SpeciesApi } from '../'
import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/views/View'

const ArabidopsisGeneInfoView: View<GeneInfoViewData> = {
  ...GeneInfoView,
  loadData: GeneInfoViewLoader,
}

const arabidopsis: Species<[View<GeneInfoViewData>]> = new Species(
  'Arabidopsis',
  { autocomplete, searchGene },
  [ArabidopsisGeneInfoView]
)
async function autocomplete(s: string) {
  return (
    await axios.get(
      'https://bar.utoronto.ca/eplant/cgi-bin/idautocomplete.cgi?species=Arabidopsis_thaliana&term=' +
        s
    )
  ).data
}

async function searchGene(s: string) {
  const data = (
    await axios.get(
      'https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=' +
        s
    )
  ).data
  const gene = new GeneticElement(
    data.id,
    data.annotation,
    arabidopsis,
    data.aliases
  )
  return gene
}

export default arabidopsis
