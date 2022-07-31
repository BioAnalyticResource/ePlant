import React from 'react'
import { View } from '../View'

const GetStartedView: View = {
  name: 'Get started',
  component: () => <div>Get started</div>,
  getInitialData: async () => ({}),
  id: 'get-started',
}

export default GetStartedView
