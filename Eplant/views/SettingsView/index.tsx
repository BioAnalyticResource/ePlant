import React from 'react'
import { Typography } from '@mui/material'
import { View } from '../../View'
import component from './component'

const SettingsView: View = {
  name: 'Settings',
  component,
  async getInitialData() {
    return null
  },
  id: 'settings',
  header(props) {
    return <Typography variant="h2">Settings</Typography>
  },
}

export default SettingsView
