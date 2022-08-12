import React from 'react'
import { Typography } from '@mui/material'
import { View } from '../../View'
import component from './component'

const GetStartedView: View = {
  name: 'Get started',
  component,
  getInitialData: async () => ({}),
  id: 'get-started',
  getInitialState() {
    return null
  },
  header(props) {
    return <></>
  },
}

export default GetStartedView
