import { Typography } from '@mui/material'
import React from 'react'
import { View } from '../../View'

const FallbackView: View<null> = {
  name: 'Unknown view',
  component: () => <div>Unknown view</div>,
  async getInitialData() {
    return null
  },
  id: 'fallback',
  header: ({ geneticElement }) => (
    <Typography variant='h6'>{geneticElement?.id}</Typography>
  ),
}

export default FallbackView
