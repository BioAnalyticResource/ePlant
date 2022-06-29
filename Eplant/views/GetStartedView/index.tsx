import React from 'react'
import { View } from '../View'

const GetStartedView: View<{}> = {
  name: 'Get started',
  component: () => <div>Get started</div>,
  loadData: async () => ({}),
}

export default GetStartedView
