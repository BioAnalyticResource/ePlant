import { Start } from '@mui/icons-material'
import React from 'react'
import { View } from '../View'

const FallbackView: View = {
  name: 'Unknown view',
  component: () => <div>Unknown view</div>,
  loadData: async () => ({}),
  id: 'fallback',
}

export default FallbackView
