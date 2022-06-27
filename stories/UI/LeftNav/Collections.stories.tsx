import * as React from 'react'
import { useGeneticElements } from '@eplant/contexts/geneticElements'
import { Collections } from '@eplant/UI/LeftNav/Collections'
import { ComponentMeta } from '@storybook/react'

export const Default = () => {
  return <Collections></Collections>
}

export default {
  title: 'Collections',
  component: Collections,
} as ComponentMeta<typeof Collections>
