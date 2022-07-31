import * as React from 'react'
import GetStartedView from '@eplant/views/GetStartedView'
import { ComponentMeta } from '@storybook/react'

export default {
  title: 'Get Started View',
  component: GetStartedView.component,
} as ComponentMeta<typeof GetStartedView.component>

export const Default = () => (
  <GetStartedView.component activeData={undefined} geneticElement={null} />
)
