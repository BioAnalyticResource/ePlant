import { z } from 'zod'

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
export const ChromosomeViewerStateScheme = z.object({
  transform: z.object({
    dx: z.number().default(300),
    dy: z.number().default(300),
    dZoom: z.number().min(0.25).max(4).default(0.7),
  }),
})

export type ChromosomeViewerState = z.infer<typeof ChromosomeViewerStateScheme>

export type ChromosomeViewerAction = {
  type: 'set-transform'
  transform: Transform
}
