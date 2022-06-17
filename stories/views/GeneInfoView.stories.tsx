import * as React from 'react'
import { ComponentMeta, Story } from '@storybook/react'
import data from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { GeneInfoView } from '@eplant/views/GeneInfoView'
import arabidopsis from '@eplant/Species/arabidopsis'

export default {
  title: 'Gene Info View',
  component: GeneInfoView.component,
} as ComponentMeta<typeof GeneInfoView.component>

export const Default: Story = () => (
  <GeneInfoView.component {...data}></GeneInfoView.component>
)
/*export const Second: Story = async () => (
  <GeneInfoView.component {...(await arabidopsis.views[0].)}></GeneInfoView.component>
)*/
