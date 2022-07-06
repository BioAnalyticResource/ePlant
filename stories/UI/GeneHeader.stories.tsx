import GeneHeader from '@eplant/UI/GeneHeader'
import { ComponentMeta, Story } from '@storybook/react'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'

export default {
  title: 'GeneHeader',
  component: GeneHeader,
} as ComponentMeta<typeof GeneHeader>

export const Default: Story = () => (
  <GeneHeader geneticElement={exampleData.geneticElement} />
)
    