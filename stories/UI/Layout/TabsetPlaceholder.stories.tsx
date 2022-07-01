import * as React from 'react'
import { LeftNav } from '@eplant/UI/LeftNav'
import { ComponentMeta } from '@storybook/react'
import TabsetPlaceholder from '@eplant/UI/Layout/TabsetPlaceholder'

export const Default = () => <TabsetPlaceholder addTab={() => {}} />

export default {
  title: 'Tabset Placeholder',
  component: TabsetPlaceholder,
} as ComponentMeta<typeof TabsetPlaceholder>
