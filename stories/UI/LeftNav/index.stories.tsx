import arabidopsis from '@eplant/Species/arabidopsis'
import { LeftNav } from '@eplant/UI/LeftNav'
import { ComponentMeta } from '@storybook/react'

export const Default = () => <LeftNav></LeftNav>

export default {
  title: 'LeftNav',
  component: LeftNav,
} as ComponentMeta<typeof LeftNav>
