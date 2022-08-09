import * as React from 'react'
import component from './component'
import { Info, InfoOutlined } from '@mui/icons-material'
import { View } from '../View'
import { Link, Typography } from '@mui/material'
import { GeneInfoViewData } from './data'
import GeneInfoViewIcon from './icon'

/**
 * Show information about a gene, including its sequence and features.
 */
const GeneInfoView: View<GeneInfoViewData> = {
  name: 'Gene info viewer',
  id: 'gene-info',
  //TODO: figure out how to make this a component lazy
  // component: React.lazy(() => import('./component')),
  component: component,
  icon: () => <GeneInfoViewIcon />,
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
  header: ({ geneticElement }) => (
    <Typography variant="h6">Information on {geneticElement?.id}</Typography>
  ),
}

export default GeneInfoView
