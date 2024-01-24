import { Link, Tab, Tabs, Typography, Theme, useTheme } from '@mui/material'
import * as React from 'react'
import { View, ViewProps } from '../../View'
import { GeneRIFs } from './GeneRIFs'
import { Publications } from './Publications'
import { PublicationViewerData, TabValues } from './types'
import PublicationViewerIcon from './icon'
import ThumbnailLight from '../../../thumbnails/publication-viewer-light.png'
import ThumbnailDark from '../../../thumbnails/publication-viewer.png'
import { ViewDataError } from '@eplant/View/viewData'


const PublicationViewer: View<PublicationViewerData> = {
  name: 'Publication viewer',
  id: 'publication-viewer',
  component({
    geneticElement,
    activeData,
  }: ViewProps<PublicationViewerData, null, null>) {
    const [tab, setTab] = React.useState<TabValues>('publications')
    const theme = useTheme()
    return (
      <div>
        <Tabs value={tab} onChange={(e, val: TabValues) => setTab(val)}>
          <Tab label="PUBLICATIONS" value="publications" />
          <Tab label="GENE RIFS" value="geneRIFs" />
        </Tabs>
        <div hidden={tab !== 'publications'} style={{background: theme.palette.background.paperOverlay, padding: '0rem 1rem', border: '1px solid', borderRadius: theme.shape.borderRadius, borderTopLeftRadius: 0, borderColor: theme.palette.background.edgeLight}}>
          {tab === 'publications' && (
            <Publications publications={activeData.publications} />
          )}
        </div>
        <div hidden={tab !== 'geneRIFs'} style={{background: theme.palette.background.paperOverlay, padding: '0rem 1rem', border: '1px solid', borderRadius: theme.shape.borderRadius, borderTopLeftRadius: 0, borderColor: theme.palette.background.edgeLight}}>
          {tab === 'geneRIFs' && <GeneRIFs geneRIFs={activeData.geneRIFs} />}
        </div>
      </div>
    )
  },
  icon: () => <PublicationViewerIcon />,
  description: 'Find publications that mention your gene of interest.',
  // TODO: If dark theme is active, use ThumbnailDark
  thumbnail: ThumbnailLight,
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
