import * as React from 'react'
import { ComponentMeta, Story } from '@storybook/react'
import data from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { GeneInfoView } from '@eplant/views/GeneInfoView'

export default {
  title: 'Gene Info View',
  component: GeneInfoView.component,
} as ComponentMeta<typeof GeneInfoView.component>

export const Default: Story = () => (
  <GeneInfoView.component {...data}></GeneInfoView.component>
)
