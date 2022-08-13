import { Typography } from '@mui/material'
import React from 'react'
import { View } from '../../View'

const FallbackView: View<void> = {
  name: 'Unknown view',
  component: () => <div>Unknown view</div>,
  id: 'fallback',
  header: ({ geneticElement }) => (
    <Typography variant="h6">{geneticElement?.id}</Typography>
  ),
}

export default FallbackView
