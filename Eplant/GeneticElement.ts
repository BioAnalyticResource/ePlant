import Species from './Species'
import { View } from './views/View'

export type SerializedGeneticElement = {
  id: string
  species: string
  annotation: string
  aliases: string[]
  views: string[]
}

/**
 * A genetic element. Contains information about the gene, the species it belongs to, and the views that can be used to display it.
 */
export default class GeneticElement {
  annotation: string
  id: string
  species: Species
  aliases: string[]
  views: View<any>[]
  constructor(
    id: string,
    annotation: string,
    species: Species,
    aliases: string[],
    views: View<any>[]
  ) {
    this.id = id
    this.annotation = annotation
    this.species = species
    this.aliases = aliases
    this.views = views
  }
  static serialize(element: GeneticElement): SerializedGeneticElement {
    return {
      id: element.id,
      species: element.species.name,
      annotation: element.annotation,
      aliases: element.aliases,
      views: element.views.map((view) => view.id),
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
      []
    )
  }
}
