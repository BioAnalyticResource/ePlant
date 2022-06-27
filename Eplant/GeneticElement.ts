import Species from './Species'
import { View } from './views/View'

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
}
