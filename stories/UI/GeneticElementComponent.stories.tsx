import GeneticElementComponent from '@eplant/UI/GeneticElementComponent'
import { ComponentMeta } from '@storybook/react'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'

export const Selected = () => (
  <GeneticElementComponent
    geneticElement={exampleData.geneticElement}
    selected={true}
  ></GeneticElementComponent>
)
Selected.args = {
  selected: true,
}
export const Deselected = () => (
  <GeneticElementComponent
    geneticElement={exampleData.geneticElement}
    selected={false}
  ></GeneticElementComponent>
)

export default {
  title: 'GeneticElementComponent',
  component: GeneticElementComponent,
} as ComponentMeta<typeof GeneticElementComponent>
