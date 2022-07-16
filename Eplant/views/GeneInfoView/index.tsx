import * as React from 'react'
import _ from 'lodash'
import component from './component'
import { Info } from '@mui/icons-material'
import { View, ViewDataError } from '../View'

export type GeneFeature = {
  type:
    | 'exon'
    | 'CDS'
    | 'five_prime_UTR'
    | 'three_prime_UTR'
    | 'gene'
    | 'mRNA'
    | 'transcript_region'
  uniqueID: string
  start: number
  end: number
  subfeatures: GeneFeature[]
  strand: string
}

export type GeneInfoViewData = {
  name: string
  brief_description: string
  computational_description: string
  curator_summary: string
  location: string
  chromosome_start: number
  chromosome_end: number
  strand: string
  geneSequence: string
  geneticElementType:
    | 'protein_coding'
    | 'novel_transcribed_region'
    | 'non_coding'
  features: GeneFeature[]
  proteinSequence?: string
}
/**
 * Show information about a gene, including its sequence and features.
 */
export const GeneInfoView: View<GeneInfoViewData> = {
  name: 'Gene info',
  id: 'gene-info',
  //TODO: figure out how to make this a component lazy
  // component: React.lazy(() => import('./component')),
  component: component,
  icon: () => <Info />,
  async loadData(gene, loadEvent) {
    if (!gene) throw ViewDataError.NO_GENE_PROVIDED
    if (gene.species.api.loaders[this.id])
      return await gene.species.api.loaders[this.id](gene, loadEvent)
    else throw ViewDataError.UNSUPPORTED_GENE
  },
}
