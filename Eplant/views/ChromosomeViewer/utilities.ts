//------------------
// Helper Functions for Chromosome.tsx
//------------------

import {
  ChromosomeItem,
  GeneAnnotationItem,
  GeneItem,
  GeneRange,
} from './types'

/**
 * formats a GeneItem into GeneAnnotationItem
 */
export const getGeneAnnotation = (gene: GeneItem): GeneAnnotationItem => {
  const genePixelLoc: number = ((gene.start + gene.end) / 2) * 0.000015
  const geneAnnotation: GeneAnnotationItem = {
    id: gene.id,
    chromosome: gene.chromosome,
    location: genePixelLoc,
    strand: gene.strand,
  }
  return geneAnnotation
}
/**
 * Gets the Chromosome svg element.
 */
export const getChromosomeSvg = (
  chrId: string
): HTMLElement & SVGSVGElement => {
  const svg = document.getElementById(chrId + '_svg') as HTMLElement &
    SVGSVGElement
  return svg
}
/**
 * Gets the Chromosome top y-coordinate.
 */
export const getChromosomeYCoordinate = (id: string): number => {
  return getChromosomeSvg(id).getBoundingClientRect().top
}
/**
 * Gets the Chromosome right x-coordinate.
 */
export const getChromosomeXCoordinate = (id: string): number => {
  return getChromosomeSvg(id).getBoundingClientRect().right
}
/**
 * Gets the height of the Chromosome.
 */
export const getChromosomeHeight = (id: string): number => {
  return getChromosomeSvg(id).getBoundingClientRect().height
}
/**
 * Gets the number of base-pairs per pixel.
 */
export const getBpPerPixel = (chromosome: ChromosomeItem): number => {
  return chromosome.size / (getChromosomeHeight(chromosome.id) - 1)
}
/**
 * Converts a pixel value to the equivalent base-pair range.
 */
export const pixelToBp = (
  range: GeneRange,
  chromosome: ChromosomeItem,
  pixel: number
): GeneRange => {
  const id = chromosome.id
  if (
    pixel > getChromosomeYCoordinate(id) &&
    pixel < getChromosomeYCoordinate(id) + getChromosomeHeight(id)
  ) {
    const range = {
      start: Math.floor(
        (pixel - 1 - getChromosomeYCoordinate(id)) * getBpPerPixel(chromosome) +
          1
      ),
      end: Math.floor(
        (pixel - getChromosomeYCoordinate(id)) * getBpPerPixel(chromosome)
      ),
    }
    if (range.end > chromosome.size) {
      range.end = chromosome.size
    }
    return range
  } else {
    return {
      start: 0,
      end: 0,
    }
  }
}
