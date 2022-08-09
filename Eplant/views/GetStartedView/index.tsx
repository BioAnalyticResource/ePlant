import { Typography } from '@mui/material'
import React from 'react'
import { View } from '../View'

const GetStartedView: View = {
  name: 'Get started',
  component: () => <div>Get started</div>,
  getInitialData: async () => ({}),
  id: 'get-started',
  header: () => <Typography variant="h6">Get started</Typography>,
}

export default GetStartedView
