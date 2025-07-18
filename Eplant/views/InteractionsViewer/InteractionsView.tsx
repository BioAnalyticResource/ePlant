import { useEffect, useRef, useState } from 'react'
import cytoscape, { Core } from 'cytoscape'
import { useOutletContext } from 'react-router-dom'

import GeneticElement from '@eplant/GeneticElement'
import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import { ViewDataError } from '@eplant/View'
import { useQuery } from '@tanstack/react-query'

import Topbar from './components/Topbar'
import { addEdgeListener, addNodeListener } from './scripts/eventHandlers'
import setLayout from './scripts/layout'
import loadInteractions from './scripts/loadInteractions'
import cytoStyles from './cytoStyles'
import {
  Interaction,
  InteractionsViewData,
  InteractionsViewState,
  InteractionsViewStateSchema,
  ViewData,
} from './types'
import InteractionsView from '.'

export const InteractionsViewObject = () => {
  const { geneticElement } = useOutletContext<ViewContext>()
  const [loadAmount, setLoadAmount] = useState(0)

  const { state, setState, initializeState } =
    useURLState<InteractionsViewState>()

  const { data, isLoading, isError, error } = useQuery<
    InteractionsViewData,
    ViewDataError
  >({
    queryKey: [`interactions-view-${geneticElement?.id}`],
    queryFn: async () => {
      return await InteractionsViewLoader(geneticElement, setLoadAmount)
    },
    staleTime: 0,
    enabled: !!geneticElement,
    retry: false,
  })

  const [cyto, setCyto] = useState<Core | null>(null)
  const cyContainerRef = useRef<HTMLDivElement | null>(null) as {
    current: HTMLDivElement | null
  }
  const [containerReady, setContainerReady] = useState(false)
  const isApplyingTransform = useRef(false)

  const geneId = geneticElement?.id
  const interactionsData = data?.viewData
  const viewData = interactionsData || {
    nodes: [],
    edges: [],
    loadFlags: {
      empty: true,
      existsPDI: false,
      existsPPI: false,
      recursive: false,
    },
  }
  const elements: any = [...(viewData.nodes || []), ...(viewData.edges || [])]

  useEffect(() => {
    initializeState(InteractionsViewStateSchema)
  }, [initializeState])

  useEffect(() => {
    if (!containerReady || isLoading || !cyContainerRef.current) return

    if (cyto) {
      cyto.destroy()
    }

    const cy: Core = cytoscape({
      container: cyContainerRef.current,
      elements: elements,
      style: cytoStyles,
    })

    addNodeListener(cy)
    addEdgeListener(cy)

    if (elements.length > 0) {
      setLayout(cy, viewData.loadFlags)

      const layout = cy.layout({
        name: 'preset',
        fit: false,
      })
      layout.run()

      cy.one('layoutstop', () => {
        setTimeout(() => {
          if (state?.transform) {
            /** Apply saved transform */
            isApplyingTransform.current = true
            cy.zoom(state.transform.zoom)
            cy.pan({
              x: state.transform.offset.x,
              y: state.transform.offset.y,
            })
            setTimeout(() => {
              isApplyingTransform.current = false
            }, 100)
          } else {
            /** Only fit/center if no transform exists */
            cy.fit()
            cy.center()
          }
        }, 100)
      })
    } else {
      cy.fit()
      cy.center()
    }

    cy.style().update()
    setCyto(cy)

    return () => {
      if (cy) cy.destroy()
    }
  }, [geneId, isLoading, elements.length, containerReady])

  useEffect(() => {
    if (!cyto || !state?.transform || isLoading || elements.length === 0) return

    const currentZoom = cyto.zoom()
    const currentPan = cyto.pan()

    const zoomChanged = Math.abs(currentZoom - state.transform.zoom) > 0.001
    const panChanged =
      Math.abs(currentPan.x - state.transform.offset.x) > 1 ||
      Math.abs(currentPan.y - state.transform.offset.y) > 1

    if (zoomChanged || panChanged) {
      isApplyingTransform.current = true
      cyto.zoom(state.transform.zoom)
      cyto.pan({
        x: state.transform.offset.x,
        y: state.transform.offset.y,
      })
      setTimeout(() => {
        isApplyingTransform.current = false
      }, 100)
    }
  }, [
    cyto,
    state?.transform?.zoom,
    state?.transform?.offset.x,
    state?.transform?.offset.y,
  ])

  if (!geneticElement) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={InteractionsView}
        error={ViewDataError.UNSUPPORTED_GENE}
      ></LoadingPage>
    )
  } else if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={InteractionsView}
        error={error}
      />
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={InteractionsView}
        error={null}
      />
    )
  } else if (!data || !state) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={InteractionsView}
        error={null}
      />
    )
  }

  return (
    <div style={{ background: 'white', overflow: 'hidden' }}>
      {cyto && <Topbar cy={cyto} gene={geneId ?? ''} />}
      <div
        ref={(ref) => {
          cyContainerRef.current = ref
          if (ref) setContainerReady(true)
        }}
        id='cy'
        key={geneId}
        style={{ width: '100%', height: '80vh' }}
      ></div>
    </div>
  )
}

/**
 * Data loader function for Interactions View
 */
export const InteractionsViewLoader = async (
  geneticElement: GeneticElement | null,
  loadEvent: (loaded: number) => void
): Promise<InteractionsViewData> => {
  if (!geneticElement) throw ViewDataError.UNSUPPORTED_GENE

  let data: ViewData = {
    nodes: [],
    edges: [],
    loadFlags: {
      empty: true,
      existsPDI: false,
      existsPPI: false,
      recursive: false,
    },
  }

  if (geneticElement) {
    let recursive: string, interactions: Array<Interaction>
    const query = geneticElement.id.toUpperCase()
    const url =
      'https://bar.utoronto.ca/eplant/cgi-bin/get_interactions_dapseq.py?locus=' +
      query
    try {
      /** Fetch interaction data */
      loadEvent(25) /** Start progress */
      const response = await fetch(url)
      loadEvent(50) /** Halfway */
      const json = await response.json()
      const interactionsData = json[query]

      if (interactionsData === undefined) {
        recursive = 'false'
        interactions = []
      } else {
        /** recursive is always the last element in the array */
        recursive = interactionsData[interactionsData.length - 1]
        /** the interaction are everything else */
        interactions = interactionsData.slice(0, interactionsData.length - 1)
      }
      /** Load interactions */
      loadEvent(75)
      data = await loadInteractions(geneticElement, interactions, recursive)
      loadEvent(100) /** Complete */
    } catch (error) {
      throw ViewDataError.FAILED_TO_LOAD
    }
  }
  return {
    viewData: data,
  }
}
