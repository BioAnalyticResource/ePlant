import { useEffect, useState } from 'react'
import axios from 'axios'
import { useOutletContext } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { ViewDataError } from '@eplant/View'
import { Tab, Tabs, Typography, useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import { GeneRIFs } from './GeneRIFs'
import { Publications } from './Publications'
import {
  GeneRIFsData,
  PublicationData,
  PublicationsViewerState,
  PublicationsViewStateSchema,
  PublicationViewerData,
  TabValues,
} from './types'
import PublicationView from '.'

export const PublicationsViewer = () => {
  const { geneticElement } = useOutletContext<ViewContext>()
  const { state, setState, initializeState } =
    useURLState<PublicationsViewerState>()
  const [loadAmount, setLoadAmount] = useState(0)
  const { data, isLoading, isError, error } = useQuery<
    PublicationViewerData,
    ViewDataError
  >({
    queryKey: [`publications-${geneticElement?.id}`],
    queryFn: async () => {
      return publicationsLoader(geneticElement, setLoadAmount)
    },
    retry: false,
  })
  const theme = useTheme()
  useEffect(() => {
    initializeState(PublicationsViewStateSchema)
  }, [])
  if (!geneticElement) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={PublicationView}
        error={ViewDataError.UNSUPPORTED_GENE}
      ></LoadingPage>
    )
  } else if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={PublicationView}
        error={error}
      ></LoadingPage>
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={PublicationView}
        error={null}
      ></LoadingPage>
    )
  } else if (!data || !state) return <></>

  return (
    <div>
      <Typography variant='h6'>
        Publications related to {geneticElement?.id}
      </Typography>
      <Tabs
        value={state.tab}
        onChange={(e, val: TabValues) => setState({ ...state, tab: val })}
      >
        <Tab label='PUBLICATIONS' value='publications' />
        <Tab label='GENE RIFS' value='geneRIFs' />
      </Tabs>
      <div
        hidden={state.tab !== 'publications'}
        style={{
          background: theme.palette.background.paperOverlay,
          padding: '0rem 1rem',
          border: '1px solid',
          borderRadius: theme.shape.borderRadius,
          borderTopLeftRadius: 0,
          borderColor: theme.palette.background.edgeLight,
        }}
      >
        {state.tab === 'publications' && (
          <Publications publications={data.publications} />
        )}
      </div>
      <div
        hidden={state.tab !== 'geneRIFs'}
        style={{
          background: theme.palette.background.paperOverlay,
          padding: '0rem 1rem',
          border: '1px solid',
          borderRadius: theme.shape.borderRadius,
          borderTopLeftRadius: 0,
          borderColor: theme.palette.background.edgeLight,
        }}
      >
        {state.tab === 'geneRIFs' && <GeneRIFs geneRIFs={data.geneRIFs} />}
      </div>
    </div>
  )
}

const publicationsLoader = async (
  geneticElement: GeneticElement | null,
  setLoadAmount: (loaded: number) => void
) => {
  if (!geneticElement)
    throw new TypeError('A gene must be provided for the publication viewer')
  let loaded = 0

  const [publications, geneRIFs] = await Promise.all([
    axios
      .get<{
        result: PublicationData[]
      }>(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `publications_by_locus.php?locus=${geneticElement.id}`
      )
      .then((d) => {
        loaded++
        setLoadAmount((loaded / 2) * 100)
        return d.data.result
      }),
    axios
      .get<{
        result: GeneRIFsData[]
      }>(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `generifs_by_locus.php?locus=${geneticElement.id}`
      )
      .then((d) => {
        loaded++
        setLoadAmount((loaded / 2) * 100)
        return d.data.result
      }),
  ])

  return {
    publications,
    geneRIFs,
  }
}
