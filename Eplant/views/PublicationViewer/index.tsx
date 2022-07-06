import { Tab, Tabs } from '@mui/material'
import * as React from 'react'
import { ViewProps } from '../View'
import GeneHeader from '@eplant/UI/GeneHeader'
import { GeneRIFs } from './GeneRIFs'
import { Publications } from './Publications'
import { PublicationViewerData, TabValues } from './types'

export const PublicationViewer = {
  name: 'Publication Viewer',
  id: 'publication-viewer',
  component({ geneticElement, activeData }: ViewProps<PublicationViewerData>) {
    const [tab, setTab] = React.useState<TabValues>('publications')
    return (
      <div>
        <GeneHeader geneticElement={geneticElement} />
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
}
