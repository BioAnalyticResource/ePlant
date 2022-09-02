import * as React from 'react'
import { View } from '../View'
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
