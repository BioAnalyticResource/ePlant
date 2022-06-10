import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/views/View'

type SpeciesApi = {
  searchGene: (term: string) => Promise<GeneticElement | null>
  autocomplete: (term: string) => Promise<string[]>
}

export default class Species {
  name: string
  api: SpeciesApi
  views: Array<View<any>>
  constructor(name: string, api: SpeciesApi, views: Array<View<any>>) {
    this.name = name
    this.api = api
    this.views = views
  }
}
