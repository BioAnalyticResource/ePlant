import { Link, Tab, Tabs } from '@mui/material'
import * as React from 'react'
import { View, ViewProps } from '../View'
import { GeneRIFs } from './GeneRIFs'
import { Publications } from './Publications'
import { PublicationViewerData, TabValues } from './types'
import { DocumentScanner } from '@mui/icons-material'

const PublicationViewer: View<PublicationViewerData> = {
  name: 'Publication Viewer',
  id: 'publication-viewer',
  component({
    geneticElement,
    activeData,
  }: ViewProps<PublicationViewerData, never>) {
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
  icon: () => <DocumentScanner />,
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
}

export default PublicationViewer
