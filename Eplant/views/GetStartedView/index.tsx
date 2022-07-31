import React from 'react'
import { View } from '../View'

const GetStartedView: View<void> = {
  name: 'Get started',
  component: () => <div>Get started</div>,
  getInitialData: async () => {},
  id: 'get-started',
}

export default GetStartedView
