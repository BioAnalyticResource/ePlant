import GeneInfoView from '@eplant/views/GeneInfoView'
import { defaultConfig } from '@eplant/main'
import { View, ViewDataError } from '@eplant/views/View'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { ViewContainer } from '@eplant/UI/Layout/ViewContainer'
import { ComponentMeta } from '@storybook/react'
import React from 'react'
import GeneticElement from '@eplant/GeneticElement'
import { HourglassFull } from '@mui/icons-material'
import delayed from '@eplant/util/delayed'
import { Config } from '@eplant/config'

export default {
  title: 'View Container',
  component: ViewContainer,
} as ComponentMeta<typeof ViewContainer>

const AlwaysLoadingView: View = {
  component: () => <div></div>,
  id: 'always-loading',
  getInitialData(gene, loadState) {
    setInterval(() => {
      loadState((Date.now() % 100000) / 100000)
    }, 10)
    return new Promise(() => {})
  },
  name: 'Always loading',
}

const UnsupportedView: View = {
  component: () => <div></div>,
  id: 'always-unsupported',
  async getInitialData(gene, loadState) {
    setInterval(() => {
      loadState((Date.now() % 100000) / 100000)
    }, 10)
    await delayed.call(() => {
      throw ViewDataError.UNSUPPORTED_GENE
    }, 1000)
    return new Promise(() => {})
  },
  name: 'Always unsupported',
}

const ErrorView: View = {
  component: () => <div></div>,
  id: 'always-crashes',
  async getInitialData(gene, loadState) {
    setInterval(() => {
      loadState((Date.now() % 100000) / 100000)
    }, 10)
    await delayed.call(() => {
      throw new Error('crap')
    }, 1000)
    return new Promise(() => {})
  },
  name: 'Always crashes',
  icon: () => <HourglassFull />,
}

const geneticElement = { ...(exampleData.geneticElement as GeneticElement) }

export const Loading = () => {
  return (
    <Config.Provider value={{ ...defaultConfig, views: [AlwaysLoadingView] }}>
      <ViewContainer
        view={AlwaysLoadingView}
        setView={() => {}}
        gene={geneticElement}
      ></ViewContainer>
    </Config.Provider>
  )
}
export const UnsupportedGene = () => {
  return (
    <Config.Provider value={{ ...defaultConfig, views: [UnsupportedView] }}>
      <ViewContainer
        view={UnsupportedView}
        setView={() => {}}
        gene={geneticElement}
      ></ViewContainer>
    </Config.Provider>
  )
}
export const Default = () => {
  return (
    <Config.Provider value={defaultConfig}>
      <ViewContainer
        view={
          {
            ...GeneInfoView,
            getInitialData: async () => exampleData.activeData,
          } as View<typeof exampleData.activeData>
        }
        setView={() => {}}
        gene={geneticElement}
      ></ViewContainer>
    </Config.Provider>
  )
}

export const NoGeneProvided = () => {
  return (
    <Config.Provider value={{ ...defaultConfig, views: [GeneInfoView] }}>
      <ViewContainer
        view={GeneInfoView}
        setView={() => {}}
        gene={null}
      ></ViewContainer>
    </Config.Provider>
  )
}

export const BrokenLoader = () => {
  return (
    <Config.Provider value={{ ...defaultConfig, views: [ErrorView] }}>
      <ViewContainer
        view={ErrorView}
        setView={() => {}}
        gene={geneticElement}
      ></ViewContainer>
    </Config.Provider>
  )
}
