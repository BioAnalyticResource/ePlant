// Centromere
export interface CentromereItem {
  id: string
  start: number
  end: number
}
// Chromosome
export interface ChromosomeItem {
  id: string
  name: string
  size: number
  centromeres: CentromereItem[] | []
}
export interface ChromosomesResponseObj {
  species: string
  chromosomes: ChromosomeItem[]
}

// Genes
export interface GeneItem {
  id: string
  chromosome: string
  start: number
  end: number
  strand: string
  aliases: []
  annotation: string
}
export interface GeneAnnotationItem {
  id: string
  chromosome: string
  location: number // y coordinate of gene
  strand: string // influences if gene is left or right of chromosome
}

export interface GeneRange {
  start: number
  end: number
}
// Component Props
export type Transform = {
  dx: number
  dy: number
  dZoom: number
}
export type ChromosomeViewerData = {
  viewData: ChromosomeItem[]
}
export type ChromosomeViewerState = {
  transform: Transform
}
export type ChromosomeViewerAction = {
  type: 'set-transform'
  transform: Transform
}
