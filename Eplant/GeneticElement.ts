import Species from './Species'

export default class GeneticElement {
  name: string
  id: string
  species: Species
  constructor(name: string, id: string, species: Species) {
    this.name = name
    this.id = id
    this.species = species
  }
}
