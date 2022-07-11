import { Start } from '@mui/icons-material'
import React from 'react'
import { View } from '../View'

const NotSupportedView: View<{}> = {
  name: 'Not supported',
  component: (props) => <div>Please select a different view</div>,
  loadData: async () => ({}),
  id: 'not-supported',
  icon: () => <Start />,
}

export default NotSupportedView
