import { ViewDataError } from '@eplant/View/viewData'
import { Link, Typography } from '@mui/material'

import { View } from '../../View'

import component from './component'
import GeneInfoViewIcon from './icon'
import { GeneInfoViewData } from './types'

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
  getInitialState() {
    return null
  },
  getInitialData() {
    // Loader override for the genes species must be undefined if getInitialData is being called
    throw ViewDataError.UNSUPPORTED_GENE
  },
  citation({ gene }) {
    return (
      <div>
        <Typography variant='h6'>Information on {gene?.id}</Typography>
        Data for this view comes from TAIR{' '}
        <Link href='http://www.arabidopsis.org/download_files/Genes/Araport11_genome_release/Araport11_GFF3_genes_transposons.201606.gff.gz'>
          GFF3
        </Link>
        , TAIR{' '}
        <Link href='http://www.arabidopsis.org/download_files/Genes/Araport11_genome_release/Araport11_blastsets/Araport11_genes.201606.pep.fasta.gz'>
          Protein Sequences
        </Link>
        , TAIR{' '}
        <Link href='https://www.arabidopsis.org/download_files/Public_Data_Releases/TAIR_Data_20190331/gene_aliases_20190402.txt.gz'>
          Gene Aliases
        </Link>
        , TAIR{' '}
        <Link href='https://www.arabidopsis.org/download_files/Public_Data_Releases/TAIR_Data_20190331/Araport11_functional_descriptions_20190402.txt.gz'>
          Functional description
        </Link>{' '}
        and TAIR10 Genome Sequence.
      </div>
    )
  },
}

export default GeneInfoView
