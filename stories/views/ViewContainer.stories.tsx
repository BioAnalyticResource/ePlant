import { View } from '@eplant/views/View'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { ViewContainer } from '@eplant/views/ViewContainer'
import { ComponentMeta, Story } from '@storybook/react'
import React from 'react'
import { GeneInfoView } from '@eplant/views/GeneInfoView'

import ArabidopsisGeneInfoView from '@eplant/Species/arabidopsis/loaders/GeneInfoView'

const AlwaysLoadingView: View = {
  component: () => <div></div>,
  loadData(gene, loadState) {
    console.log('load data')
    setInterval(() => {
      loadState((Date.now() % 100000) / 100000)
    }, 10)
    return new Promise(() => {})
  },
  name: 'Always loading',
}

const geneticElement = { ...exampleData.geneticElement }
geneticElement.views = [ArabidopsisGeneInfoView, AlwaysLoadingView]

export default {
  title: 'View Container',
  component: ViewContainer,
} as ComponentMeta<typeof ViewContainer>

export const Loading = () => {
  return (
    <ViewContainer
      view={AlwaysLoadingView}
      setView={() => {}}
      gene={geneticElement}
    ></ViewContainer>
  )
}
export const Default = () => {
  return (
    <ViewContainer
      view={
        {
          ...GeneInfoView,
          loadData: async () => exampleData.activeData,
        } as View<typeof exampleData.activeData>
      }
      setView={() => {}}
      gene={geneticElement}
    ></ViewContainer>
  )
}
