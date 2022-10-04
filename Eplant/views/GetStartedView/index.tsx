import * as React from 'react'
import { View } from '../View'
import component from './component'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'

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
  icon: () => <HomeOutlinedIcon />,
}

export default GetStartedView
