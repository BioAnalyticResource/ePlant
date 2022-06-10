import Species from './Species'

export default class GeneticElement {
  annotation: string
  id: string
  species: Species
  aliases: string[]
  constructor(
    id: string,
    annotation: string,
    species: Species,
    aliases: string[]
  ) {
    this.id = id
    this.annotation = annotation
    this.species = species
    this.aliases = aliases
  }
}
