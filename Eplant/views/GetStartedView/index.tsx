import * as React from 'react'
import { View } from '../View'
import component from './component'

const GetStartedView: View = {
  name: 'Get started',
  component: component,
  getInitialData: async () => ({}),
  id: 'get-started',
}

export default GetStartedView
