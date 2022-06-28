import { styled, Tab, Tabs, Typography } from '@mui/material'
import * as React from 'react'
import { ViewProps } from '../View'
import { GeneRIFs } from './GeneRIFs'
import { Publications } from './Publications'
import { PublicationViewerData, TabValues } from './types'

const SecondaryColour = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

export const PublicationViewer = {
  name: 'Publication Viewer',
  dataType: PublicationViewerData,
  component({ geneticElement, activeData }: ViewProps<PublicationViewerData>) {
    const [tab, setTab] = React.useState<TabValues>('publications')
    return (
      <div>
        <Typography variant='h4'>
          {geneticElement.id} <SecondaryColour>I</SecondaryColour> {geneticElement.aliases.join(', ')}
        </Typography>
        <Tabs value={tab} onChange={(e, val) => setTab(val)}>
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
