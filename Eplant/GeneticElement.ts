export type SerializedGeneticElement = {
  id: string
  species: string
  annotation: string
  aliases: string[]
}

/**
 * A genetic element. Contains information about the gene, the species it belongs to, and the views that can be used to display it.
 */
export default class GeneticElement {
  annotation: string
  id: string
  species: Species
  aliases: string[]
  constructor(
    id: string,
    annotation: string,
    species: Species,
    aliases: string[],
  ) {
    this.id = id
    this.annotation = annotation
    this.species = species
    this.aliases = aliases
  }
  static serialize(element: GeneticElement): SerializedGeneticElement {
    return {
      id: element.id,
      species: element.species.name,
      annotation: element.annotation,
      aliases: element.aliases,
    }
  }
  static deserialize(geneticElement: SerializedGeneticElement): GeneticElement {
    if (!Species.getSpecies(geneticElement.species))
      throw new Error('Species does not exist')
    return new GeneticElement(
      geneticElement.id,
      geneticElement.annotation,
      Species.getSpecies(geneticElement.species) as Species,
      geneticElement.aliases,
    )
  }
}

/**
 * Contains methods for loading information related to genes
 */
export type SpeciesApi = {
  searchGene: (term: string) => Promise<GeneticElement | null>
  autocomplete: (term: string) => Promise<string[]>
  loaders: {
    [key: string]: (
      gene: GeneticElement,
      loadEvent: (amount: number) => void,
    ) => Promise<any>
  }
}

/**
 * A species. Contains information about the species, and the API to search for genes.
 */
export class Species {
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
    geneId: string,
  ): Promise<GeneticElement | null> {
    const species = Species.getSpecies(speciesId)
    if (!species) return Promise.resolve(null)
    return species.api.searchGene(geneId)
  }
}
