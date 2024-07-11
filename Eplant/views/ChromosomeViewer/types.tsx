// Centromere
export interface CentromereItem {
  id: string
  start: number
  end: number
}
export interface CentromereList extends Array<CentromereItem> {}
// Chromosome
export interface ChromosomeItem {
  id: string
  name: string
  size: number
  centromeres: CentromereList | []
}
export interface ChromosomeList extends Array<ChromosomeItem> {}
export interface ChromosomesResponseObj {
  species: string
  chromosomes: ChromosomeList
}
// Annotation Gene Item contains only neccary information for drawing the gene annotation
export interface GeneAnnotationItem {
  id: string
  chromosome: string
  location: number // y coordinate of gene
  strand: string // influences if gene is left or right of chromosome
  active?: boolean
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
export interface GeneArray extends Array<GeneItem> {}

// Component Props
export type Transform = {
  dx: number
  dy: number
  dZoom: number
}
export type ChromosomeViewerData = ChromosomeList
export type ChromosomeViewerState = {
  transform: Transform
}
export type ChromosomeViewerAction =
  | { type: 'toggle-heatmap' }
  | { type: 'set-transform'; transform: Transform }
