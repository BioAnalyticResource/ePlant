import { useGeneticElements } from '@eplant/contexts/geneticElements'
import { Collections, Collection } from '@eplant/UI/LeftNav/Collections'
import { ComponentMeta } from '@storybook/react'

export const Default = () => {
  const genes = useGeneticElements()[0]
  return <Collection genes={genes} name="Collection 1"></Collection>
}

export default {
  title: 'Collection',
  component: Collection,
} as ComponentMeta<typeof Collection>
