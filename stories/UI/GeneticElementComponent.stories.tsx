import GeneticElementComponent from '@eplant/UI/GeneticElementComponent'
import { ComponentMeta } from '@storybook/react'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import React from 'react'
import GeneticElement from '@eplant/GeneticElement'

export const Selected = () => {
  return (
    <GeneticElementComponent
      geneticElement={exampleData.geneticElement as GeneticElement}
      selected={true}
    ></GeneticElementComponent>
  )
}
Selected.args = {
  selected: true,
}
export const Deselected = () => (
  <GeneticElementComponent
    geneticElement={exampleData.geneticElement as GeneticElement}
    selected={false}
  ></GeneticElementComponent>
)

export default {
  title: 'GeneticElementComponent',
  component: GeneticElementComponent,
} as ComponentMeta<typeof GeneticElementComponent>
