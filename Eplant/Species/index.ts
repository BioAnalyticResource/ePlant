import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/views/View'

/**
 * Contains methods for loading information related to genes
 */
export type SpeciesApi = {
  searchGene: (term: string) => Promise<GeneticElement | null>
  autocomplete: (term: string) => Promise<string[]>
}

/**
 * A species. Contains information about the species, and the API to search for genes.
 */
export default class Species {
  name: string
  api: SpeciesApi
  constructor(name: string, api: SpeciesApi) {
    this.name = name
    this.api = api
  }
}
