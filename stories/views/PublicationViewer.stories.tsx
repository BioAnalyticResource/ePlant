import * as React from 'react'
import { ComponentMeta, Story } from '@storybook/react'
import data from '@eplant/Species/arabidopsis/loaders/PublicationViewer/exampleData'
import PublicationViewer from '@eplant/views/PublicationViewer'

export default {
  title: 'Publication Viewer',
  component: PublicationViewer.component,
} as ComponentMeta<typeof PublicationViewer.component>

export const Default: Story = () => (
  <PublicationViewer.component {...data}></PublicationViewer.component>
)
