import { View, ViewDataError } from '@eplant/views/View'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { ViewContainer } from '@eplant/UI/Layout/ViewContainer'
import { ComponentMeta, Story } from '@storybook/react'
import React from 'react'
import { GeneInfoView } from '@eplant/views/GeneInfoView'

import ArabidopsisGeneInfoView from '@eplant/Species/arabidopsis/loaders/GeneInfoView'
import GeneticElement from '@eplant/GeneticElement'
import { HourglassFull } from '@mui/icons-material'
import { Provider } from 'jotai'
import { viewsAtom } from '@eplant/state'
import delayed from '@eplant/util/delayed'

const AlwaysLoadingView: View = {
  component: () => <div></div>,
  id: 'always-loading',
  loadData(gene, loadState) {
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
  async loadData(gene, loadState) {
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
  async loadData(gene, loadState) {
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

export default {
  title: 'View Container',
  component: ViewContainer,
} as ComponentMeta<typeof ViewContainer>

export const Loading = () => {
  return (
    <Provider initialValues={[[viewsAtom, [AlwaysLoadingView]]]}>
      <ViewContainer
        view={AlwaysLoadingView}
        setView={() => {}}
        gene={geneticElement}
      ></ViewContainer>
    </Provider>
  )
}
export const UnsupportedGene = () => {
  return (
    <Provider initialValues={[[viewsAtom, [UnsupportedView]]]}>
      <ViewContainer
        view={UnsupportedView}
        setView={() => {}}
        gene={geneticElement}
      ></ViewContainer>
    </Provider>
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

export const NoGeneProvided = () => {
  return (
    <Provider initialValues={[[viewsAtom, [GeneInfoView]]]}>
      <ViewContainer
        view={GeneInfoView}
        setView={() => {}}
        gene={null}
      ></ViewContainer>
    </Provider>
  )
}

export const BrokenLoader = () => {
  return (
    <Provider initialValues={[[viewsAtom, [ErrorView]]]}>
      <ViewContainer
        view={ErrorView}
        setView={() => {}}
        gene={geneticElement}
      ></ViewContainer>
    </Provider>
  )
}
