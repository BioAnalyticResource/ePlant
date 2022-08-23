import React from 'react'
import { Typography } from '@mui/material'
import { View } from '../../View'
import component from './component'

const GetStartedView: View = {
  name: 'Get started',
  component,
  async getInitialData() {
    return null
  },
  id: 'get-started',
  header(props) {
    return <></>
  },
}

export default GetStartedView
