import * as React from 'react'
import { View, ViewProps } from '../View'

export type GeneInfoViewData = {}

export const GeneInfoView: View<GeneInfoViewData> = {
  name: 'Gene Info Viewer',
  async loadData() {
    return {}
  },
  component(props: ViewProps<GeneInfoViewData>) {
    return <div></div>
  },
}
