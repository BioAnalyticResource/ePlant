import { View } from '@eplant/views/View'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { ViewContainer } from '@eplant/UI/Layout/ViewContainer'
import { ComponentMeta, Story } from '@storybook/react'
import React from 'react'
import { GeneInfoView } from '@eplant/views/GeneInfoView'

import ArabidopsisGeneInfoView from '@eplant/Species/arabidopsis/loaders/GeneInfoView'
import GeneticElement from '@eplant/GeneticElement'
import { HourglassFull } from '@mui/icons-material'

const AlwaysLoadingView: View = {
  component: () => <div></div>,
  id: 'always-loading',
  loadData(gene, loadState) {
    console.log('load data')
    setInterval(() => {
      loadState((Date.now() % 100000) / 100000)
    }, 10)
    return new Promise(() => {})
  },
  name: 'Always loading',
  icon: () => <HourglassFull />,
}

const geneticElement = { ...(exampleData.geneticElement as GeneticElement) }

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
