import { GeneInfoView } from '@eplant/views/GeneInfoView'
import GeneInfoViewLoader from './loaders/GeneInfoView'
import axios from 'axios'
import Species, { SpeciesApi } from '../'
import GeneticElement from '@eplant/GeneticElement'

const arabidopsis = new Species('Arabidopsis', { autocomplete, searchGene }, [
  { ...GeneInfoView, loadData: GeneInfoViewLoader },
])
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
  return null
}

export default arabidopsis
