import { useEffect, useState } from 'react'
import axios from 'axios'
import { useOutletContext } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { Tab, Tabs, Typography, useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import { CellEFPViewerData } from '../CellEFP/types'

import { GeneRIFs } from './GeneRIFs'
import { Publications } from './Publications'
import {
  GeneRIFsData,
  PublicationData,
  PublicationViewerData,
  TabValues,
} from './types'

export const PublicationsView = () => {
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()
  const [tab, setTab] = useState<TabValues>('publications')
  const { data, isLoading, isError, error } = useQuery<PublicationViewerData>({
    queryKey: [`publications-${geneticElement?.id}`],
    queryFn: async () => {
      if (!geneticElement) {
        throw Error('No gene')
      }
      const data = publicationsLoader(geneticElement, setLoadAmount)
      return data
    },
    enabled: !!geneticElement,
  })
  const theme = useTheme()

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading])

  if (isLoading || isError || !data) return <></>
  return (
    <div>
      <Typography variant='h6'>
        Publications related to {geneticElement?.id}
      </Typography>
      <Tabs value={tab} onChange={(e, val: TabValues) => setTab(val)}>
        <Tab label='PUBLICATIONS' value='publications' />
        <Tab label='GENE RIFS' value='geneRIFs' />
      </Tabs>
      <div
        hidden={tab !== 'publications'}
        style={{
          background: theme.palette.background.paperOverlay,
          padding: '0rem 1rem',
          border: '1px solid',
          borderRadius: theme.shape.borderRadius,
          borderTopLeftRadius: 0,
          borderColor: theme.palette.background.edgeLight,
        }}
      >
        {tab === 'publications' && (
          <Publications publications={data.publications} />
        )}
      </div>
      <div
        hidden={tab !== 'geneRIFs'}
        style={{
          background: theme.palette.background.paperOverlay,
          padding: '0rem 1rem',
          border: '1px solid',
          borderRadius: theme.shape.borderRadius,
          borderTopLeftRadius: 0,
          borderColor: theme.palette.background.edgeLight,
        }}
      >
        {tab === 'geneRIFs' && <GeneRIFs geneRIFs={data.geneRIFs} />}
      </div>
    </div>
  )
}

const publicationsLoader = async (
  geneticElement: GeneticElement,
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
