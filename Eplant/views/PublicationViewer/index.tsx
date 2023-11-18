import { Link, Tab, Tabs, Typography } from '@mui/material'
import * as React from 'react'
import { View, ViewProps } from '../../View'
import { GeneRIFs } from './GeneRIFs'
import { Publications } from './Publications'
import { PublicationViewerData, TabValues } from './types'
import PublicationViewerIcon from './icon'
import Thumbnail from '../../../thumbnails/publication_viewer.png'
import { ViewDataError } from '@eplant/View/viewData'

const PublicationViewer: View<PublicationViewerData> = {
  name: 'Publication Viewer',
  id: 'publication-viewer',
  component({
    geneticElement,
    activeData,
  }: ViewProps<PublicationViewerData, null, null>) {
    const [tab, setTab] = React.useState<TabValues>('publications')
    return (
      <div>
        <Tabs value={tab} onChange={(e, val: TabValues) => setTab(val)}>
          <Tab label="PUBLICATIONS" value="publications" />
          <Tab label="GENE RIFS" value="geneRIFs" />
        </Tabs>
        <div hidden={tab !== 'publications'}>
          {tab === 'publications' && (
            <Publications publications={activeData.publications} />
          )}
        </div>
        <div hidden={tab !== 'geneRIFs'}>
          {tab === 'geneRIFs' && <GeneRIFs geneRIFs={activeData.geneRIFs} />}
        </div>
      </div>
    )
  },
  icon: () => <PublicationViewerIcon />,
  description: 'Find publications that mention your gene of interest.',
  thumbnail: Thumbnail,
  citation({ gene }) {
    return (
      <div>
        Data for this view comes from NCBI{' '}
        <Link href="ftp://ftp.ncbi.nlm.nih.gov/gene/DATA/gene2pubmed.gz">
          Gene2Pubmed
        </Link>
        . Data for Gene RIFs comes from NCBI{' '}
        <Link href="ftp://ftp.ncbi.nih.gov/gene/GeneRIF/generifs_basic.gz">
          Gene RIFs
        </Link>
      </div>
    )
  },
  header: ({ geneticElement }) => (
    <Typography variant="h6">
      Publications related to {geneticElement?.id}
    </Typography>
  ),
  async getInitialData() {
    // Loader override for the genes species must be undefined if getInitialData is being called
    throw ViewDataError.UNSUPPORTED_GENE
  },
}

export default PublicationViewer
