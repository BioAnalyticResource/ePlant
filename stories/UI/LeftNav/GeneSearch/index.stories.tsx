import * as React from 'react'
import { ComponentMeta, Story } from '@storybook/react'
import { SearchGroup } from '@eplant/UI/LeftNav/GeneSearch'
import Species from '@eplant/Species'
import arabidopsis from '@eplant/Species/arabidopsis'

export default {
  title: 'SearchGroup',
  component: SearchGroup,
} as ComponentMeta<typeof SearchGroup>

export const Default: Story = () => (
  <SearchGroup addGeneticElement={() => undefined}></SearchGroup>
)
