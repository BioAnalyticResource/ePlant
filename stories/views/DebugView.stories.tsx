import * as React from 'react'
import { ComponentMeta } from '@storybook/react'
import DebugView from '@eplant/views/DebugView'
import { ViewContainer } from '@eplant/UI/Layout/ViewContainer'
import { Config } from '@eplant/config'
import { defaultConfig } from '@eplant/main'

export default {
  title: 'Debug View',
  component: DebugView.component,
} as ComponentMeta<typeof DebugView.component>

export const Default = () => (
  <Config.Provider value={defaultConfig}>
    <ViewContainer setView={() => {}} gene={null} view={DebugView} />
  </Config.Provider>
)
