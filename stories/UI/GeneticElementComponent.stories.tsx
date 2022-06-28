import GeneticElementComponent from '@eplant/UI/GeneticElementComponent'
import { ComponentMeta } from '@storybook/react'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { Button, Color, Typography } from '@mui/material'
import React from 'react'
function randomColor() {
  let hex = Math.floor(Math.random() * 0xffffff)
  let color = '#' + hex.toString(16)

  return color
}

export const Selected = () => {
  return (
    <GeneticElementComponent
      geneticElement={exampleData.geneticElement}
      selected={true}
    ></GeneticElementComponent>
  )
}
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
