import * as React from 'react'
import { View } from '@eplant/View'
import component from './component'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'

const GetStartedView: View = {
  name: 'Get started',
  component,
  async getInitialData() {
    return null
  },
  id: 'get-started',
  header() {
    return <></>
  },
  icon: () => <HomeOutlinedIcon />,
}

export default GetStartedView
