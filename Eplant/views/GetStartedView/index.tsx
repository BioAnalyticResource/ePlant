import * as React from 'react'
import { View } from '@eplant/View'
import component from './component'

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
}

export default GetStartedView
