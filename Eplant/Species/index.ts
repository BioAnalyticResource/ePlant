import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/views/View'

/**
 * Contains methods for loading information related to genes
 */
export type SpeciesApi = {
  searchGene: (term: string) => Promise<GeneticElement | null>
  autocomplete: (term: string) => Promise<string[]>
  loaders: {
    [key: string]: View['loadData']
  }
}

/**
 * A species. Contains information about the species, and the API to search for genes.
 */
export default class Species {
  name: string
  api: SpeciesApi
  private static registry: Species[] = []
  constructor(name: string, api: SpeciesApi) {
    this.name = name
    this.api = api
    Species.registry.push(this)
  }

  static getSpecies(name: string): Species | null {
    return Species.registry.find((s) => s.name === name) ?? null
  }

  static getGene(
    speciesId: string,
    geneId: string
  ): Promise<GeneticElement | null> {
    const species = Species.getSpecies(speciesId)
    if (!species) return Promise.resolve(null)
    return species.api.searchGene(geneId)
  }
}
