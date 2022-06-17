import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/views/View'

export type SpeciesApi = {
  searchGene: (term: string) => Promise<GeneticElement | null>
  autocomplete: (term: string) => Promise<string[]>
}

export default class Species<T extends View<any>[] = View<any>[]> {
  name: string
  api: SpeciesApi
  views: T
  constructor(name: string, api: SpeciesApi, views: T) {
    this.name = name
    this.api = api
    this.views = views
  }
}
