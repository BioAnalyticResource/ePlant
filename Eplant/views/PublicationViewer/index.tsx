import { Link } from '@mui/material'

import ThumbnailLight from '../../../thumbnails/publication-viewer-light.png'
import { ViewMetadata } from '../../View'

import PublicationViewerIcon from './icon'
import { PublicationViewerData } from './types'

const PublicationViewer: ViewMetadata<PublicationViewerData> = {
  name: 'Publication viewer',
  id: 'publications',
  icon: () => <PublicationViewerIcon />,
  description: 'Find publications that mention your gene of interest.',
  // TODO: If dark theme is active, use ThumbnailDark
  thumbnail: ThumbnailLight,
  citation({ gene }) {
    return (
      <div>
        Data for this view comes from NCBI{' '}
        <Link href='ftp://ftp.ncbi.nlm.nih.gov/gene/DATA/gene2pubmed.gz'>
          Gene2Pubmed
        </Link>
        . Data for Gene RIFs comes from NCBI{' '}
        <Link href='ftp://ftp.ncbi.nih.gov/gene/GeneRIF/generifs_basic.gz'>
          Gene RIFs
        </Link>
      </div>
    )
  },
}

export default PublicationViewer
