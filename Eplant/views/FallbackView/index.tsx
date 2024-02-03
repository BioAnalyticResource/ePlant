import React from 'react'

import { Typography } from '@mui/material'

import { View } from '../../View'

const FallbackView: View<null> = {
  name: 'Unknown view',
  component: ({ geneticElement }) => (
    <>
      <Typography variant='h6'>{geneticElement?.id}</Typography>
      <div>Unknown view</div>,
    </>
  ),
  async getInitialData() {
    return null
  },
  id: 'fallback',
}

export default FallbackView
