import React from 'react'
import { View } from '../View'

const FallbackView: View<void> = {
  name: 'Unknown view',
  component: () => <div>Unknown view</div>,
  getInitialData: async () => {},
  id: 'fallback',
}

export default FallbackView
