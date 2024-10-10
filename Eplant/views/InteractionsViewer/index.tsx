import React, { useEffect, useRef, useState } from 'react'
import cytoscape, {
  Core,
  ElementDefinition,
  ElementsDefinition,
} from 'cytoscape'
import automove from 'cytoscape-automove'
import coseBilkent from 'cytoscape-cose-bilkent'
import popper from 'cytoscape-popper'
import tippy, { Instance as TippyInstance, Props as TProps } from 'tippy.js'

import GeneticElement from '@eplant/GeneticElement'
import { ViewDataError } from '@eplant/View/viewData'

import { View, ViewProps } from '../../View'

import { addEdgeListener, addNodeListener } from './scripts/eventHandlers'
import setLayout from './scripts/layout'
import loadInteractions from './scripts/loadInteractions'
import loadSublocalizations from './scripts/loadSublocalizations'
import cytoStyles from './cytoStyles'
import { InteractionsIcon } from './icon'
import Topbar from './Topbar'
// import GeneDialog from './GeneDialog'
import {
  Interaction,
  InteractionsViewAction,
  InteractionsViewData,
  InteractionsViewState,
  ViewData,
} from './types'

/*--------------------
CYTOSCAPE PLUGIN SETUP
---------------------- */
declare module 'cytoscape-popper' {
  interface PopperOptions extends Partial<TProps> {}
  interface PopperInstance extends TippyInstance {}
}

function tippyFactory(ref: { getBoundingClientRect: any }, content: any) {
  // Since tippy constructor requires DOM element/elements, create a placeholder
  const dummyDomEle = document.createElement('div')
  const config: Partial<TProps> = {
    getReferenceClientRect: ref.getBoundingClientRect,
    trigger: 'manual', // mandatory
    // dom element inside the tippy:
    content: content,
    // your own preferences:
    arrow: true,
    placement: 'bottom',
    hideOnClick: false,
    sticky: 'reference',

    // if interactive:
    interactive: true,
    appendTo: document.body, // or append dummyDomEle to document.body
  }
  const tip = tippy(dummyDomEle, config)
  return tip
}

cytoscape.use(popper(tippyFactory))
cytoscape.use(automove)
cytoscape.use(coseBilkent)
/* -------------------------------- */

const InteractionsViewer: View = {
  name: 'Interactions Viewer',
  id: 'interactions-viewer',

  icon: () => <InteractionsIcon />,
  description: 'Interactions Viewer.',
  citation() {
    return <div></div>
  },
  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    console.log('eeee')
    let data: ViewData
    if (gene) {
      const query = gene.id.toUpperCase()
      const url =
        'https://bar.utoronto.ca/eplant/cgi-bin/get_interactions_dapseq.py?locus=' +
        query
      loadEvent(0)
      loadEvent(20)
      loadEvent(40)
      // Fetch interaction data
      let recursive: string = ''
      const interactions = await fetch(url)
        .then((response) => response.json())
        .then((json) => json[query])
        .then((interactions: [] | undefined) => {
          console.log(interactions)
          if (interactions === undefined) {
            recursive = 'false'
            return []
          }
          recursive = interactions[interactions.length - 1]
          return interactions.slice(0, interactions.length - 1)
        })
      data = loadInteractions(gene, interactions, recursive)
      data.nodes = loadSublocalizations(data.nodes)
      loadEvent(100)
    } else {
      throw ViewDataError.UNSUPPORTED_GENE
    }
    return {
      activeView: InteractionsViewer.id,
      viewData: data,
    }
  },
  component({
    activeData,
    state,
    dispatch,
    geneticElement,
  }: ViewProps<
    InteractionsViewData,
    InteractionsViewState,
    InteractionsViewAction
  >) {
    // const [cy, setCy] = useState<Core>(cytoscape())
    const cyRef = useRef(null)
    let cy: Core
    const geneId = geneticElement?.id
    console.log(activeData)
    const viewData = activeData.viewData
    const elements: any = [...viewData.nodes, ...viewData.edges]
    const styles = cytoStyles

    useEffect(() => {
      const cy: Core = cytoscape({
        container: document.getElementById('cy'), // container to render in
        elements: elements,
        style: cytoStyles,
      })

      setLayout(cy, viewData.loadFlags)
      // Listen for mouseover events on nodes
      addNodeListener(cy)
      // Listen for mouseover events on edges
      addEdgeListener(cy)
    }, [])

    return (
      <div style={{ background: 'white' }}>
        <Topbar gene={geneId === undefined ? '' : geneId}></Topbar>
        <div
          ref={cyRef}
          id='cy'
          style={{ width: '100%', height: '80vh' }}
        ></div>
      </div>
    )
  },
}
export default InteractionsViewer
