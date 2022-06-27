import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/views/View'

export type SpeciesApi = {
  searchGene: (term: string) => Promise<GeneticElement | null>
  autocomplete: (term: string) => Promise<string[]>
}

export default class Species {
  name: string
  api: SpeciesApi
  constructor(name: string, api: SpeciesApi) {
    this.name = name
    this.api = api
  }
}
