import { Start } from '@mui/icons-material'
import React from 'react'
import { View } from '../View'

const GetStartedView: View<{}> = {
  name: 'Get started',
  component: () => <div>Get started</div>,
  loadData: async () => ({}),
  id: 'get-started',
  icon: () => <Start />,
}

export default GetStartedView
