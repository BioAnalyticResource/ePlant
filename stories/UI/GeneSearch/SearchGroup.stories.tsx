import * as React from 'react'
import { ComponentMeta, Story } from '@storybook/react'
import { SearchGroup } from '@eplant/UI/LeftNav'
import Species from '@eplant/Species'

export default {
  title: 'SearchGroup',
  component: SearchGroup,
} as ComponentMeta<typeof SearchGroup>

export const Default: Story = () => (
  <SearchGroup species={[new Species('test', 'test')]}></SearchGroup>
)
