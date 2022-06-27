import * as React from 'react'
import { useGeneticElements } from '@eplant/contexts/geneticElements'
import { Collections, Collection } from '@eplant/UI/LeftNav/Collections'
import { ComponentMeta } from '@storybook/react'

export const Default = () => {
  const genes = useGeneticElements()[0]
  return (
    <Collection
      deleteGene={() => {}}
      onRemove={() => {}}
      setOpen={() => {}}
      onNameChange={() => {}}
      open={false}
      genes={genes}
      name="Collection 1"
    ></Collection>
  )
}
export const Open = () => {
  const genes = useGeneticElements()[0]
  return (
    <Collection
      deleteGene={() => {}}
      onRemove={() => {}}
      setOpen={() => {}}
      onNameChange={() => {}}
      open={true}
      genes={genes}
      name="Collection 1"
    ></Collection>
  )
}

export default {
  title: 'Collection',
  component: Collection,
} as ComponentMeta<typeof Collection>
