import * as React from 'react'
import _ from 'lodash'
import component from './component'
import { Info } from '@mui/icons-material'
import { View, ViewDataError } from '../View'
import { Link } from '@mui/material'

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
  citation({ gene }) {
    return (
      <div>
        Data for this view comes from TAIR{' '}
        <Link href="http://www.arabidopsis.org/download_files/Genes/Araport11_genome_release/Araport11_GFF3_genes_transposons.201606.gff.gz">
          GFF3
        </Link>
        , TAIR{' '}
        <Link href="http://www.arabidopsis.org/download_files/Genes/Araport11_genome_release/Araport11_blastsets/Araport11_genes.201606.pep.fasta.gz">
          Protein Sequences
        </Link>
        , TAIR{' '}
        <Link href="https://www.arabidopsis.org/download_files/Public_Data_Releases/TAIR_Data_20190331/gene_aliases_20190402.txt.gz">
          Gene Aliases
        </Link>
        , TAIR{' '}
        <Link href="https://www.arabidopsis.org/download_files/Public_Data_Releases/TAIR_Data_20190331/Araport11_functional_descriptions_20190402.txt.gz">
          Functional description
        </Link>{' '}
        and TAIR10 Genome Sequence.
      </div>
    )
  },
}
