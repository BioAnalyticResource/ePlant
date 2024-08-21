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
import { InteractionsIcon } from './icon'
// import GeneDialog from './GeneDialog'
import {
  Interaction,
  InteractionsViewAction,
  InteractionsViewData,
  InteractionsViewState,
  ViewData,
} from './types'
import Topbar from './Topbar'

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
    console.log(activeData)
    const viewData = activeData.viewData
    const elements: any = [...viewData.nodes, ...viewData.edges]
    const styles: any = [
      {
        selector: 'node',
        style: {
          'text-background-shape': 'roundrectangle',
          'text-background-color': 'white',
          'text-background-opacity': 0.9,
          'background-color': '#f4f4f4',
          'font-size': '11px',
          //'font-weight': 'bold',
          'text-halign': 'center',
          'border-width': '0px',
          //'width': 'auto',
          'text-background-padding': '2px',
        },
      },
      {
        selector: '.compound-top',
        style: {
          shape: 'roundrectangle',
          'background-color': '#F3F3F3',
          'text-background-color': 'white',
          'text-wrap': 'wrap',
          width: '300px',
          color: '#000',
          'font-size': '10px',
          'font-weight': 'bold',
          'text-outline-width': '0px',
          'text-valign': 'top',
        },
      },
      {
        selector: '#COMPOUND_DNA',
        style: {
          'background-opacity': '0',
          'text-background-opacity': '1',
          label: 'Protein-DNA\nInteractions',
        },
      },
      {
        selector: '#COMPOUND_PROTEIN',
        style: {
          'background-opacity': '0',
          'text-background-opacity': '1',
          label: 'Protein-Protein\nInteractions',
        },
      },
      {
        selector: '.protein-compound',
        style: {
          'background-opacity': 0,
          events: 'no',
        },
      },
      {
        selector: '.protein-back[borderWidth]',
        style: {
          height: 'data(height)',
          width: 'data(width)',
          'pie-size': '100%',
          'pie-1-background-color': 'data(pie1Colour)',
          'pie-1-background-size': 'data(pie1Size)',
          'pie-1-background-opacity': 1,
          'pie-2-background-color': 'data(pie2Colour)',
          'pie-2-background-size': 'data(pie2Size)',
          'pie-2-background-opacity': 1,
          'pie-3-background-color': 'data(pie3Colour)',
          'pie-3-background-size': 'data(pie3Size)',
          'pie-3-background-opacity': 1,
          'pie-4-background-color': 'data(pie4Colour)',
          'pie-4-background-size': 'data(pie4Size)',
          'pie-4-background-opacity': 1,
          'border-width': 'data(borderWidth)',
          'border-color': '#99CC00',
          events: 'no',
        },
      },
      {
        selector: '.protein-node',
        style: {
          height: '36px',
          width: '36px',
          padding: '3px 3px 3px 3px',
          'text-valign': 'center',
          content: 'data(content)',
          events: 'yes',
          'z-index': 10,
        },
      },
      {
        selector: '[id $= "QUERY_BACK"]',
        style: {
          height: '60px',
          width: '60px',
        },
      },
      {
        selector: '[id $= "QUERY_NODE"]',
        style: {
          height: '48px',
          width: '48px',
          'font-size': '11px',
          'z-index': 10000000,
        },
      },
      {
        selector: '.dna-node',
        style: {
          shape: 'square',
          width: '34px',
          height: '34px',
          'border-width': '4px',
          padding: '3px 3px 3px 3px',
          'border-color': '#030303',
          'text-valign': 'center',
          content: 'data(content)',
          'z-index': 10,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 'data(size)',
          'line-style': 'data(lineStyle)',
          'line-color': 'data(lineColor)',
          'control-point-distance': '50px',
          'control-point-weight': '0.5',
        },
      },
      {
        selector: '.protein-edge',
        style: {
          'curve-style': 'bezier',
          'mid-target-arrow-shape': 'none',
        },
      },
      {
        selector: '.dna-edge',
        style: {
          'curve-style': 'unbundled-bezier',
          'mid-target-arrow-shape': 'triangle',
          'mid-target-arrow-color': 'data(lineColor)',
        },
      },
      {
        selector: '.chr-edge',
        style: {
          'curve-style': 'unbundled-bezier',
          'mid-target-arrow-shape': 'triangle',
          'mid-target-arrow-color': 'data(arrowColor)',
          'control-point-distance': '50px',
          'control-point-weight': '0.5',
        },
      },
      {
        selector: '.loaded',
        style: {
          'background-color': '#3C3C3C',
          'text-background-color': '#3C3C3C',
          color: '#FFFFFF',
        },
      },
      {
        selector: '#noInteractionLabel',
        style: {
          shape: 'circle',
          content: 'No interactions found for this gene.',
          width: '1px',
          height: '1px',
          color: '#000',
          'text-background-opacity': '0',
          'font-size': 15,
        },
      },
    ]

    useEffect(() => {
      const cy: Core = cytoscape({
          container: document.getElementById('cy'), // container to render in
          elements: elements,
          style: styles,
        })

      setLayout(cy, viewData.loadFlags)
      // Listen for mouseover events on nodes
      addNodeListener(cy)
      // Listen for mouseover events on edges
      addEdgeListener(cy)
    }, [])

    return (
      <div style={{ background: 'white' }}>
        <Topbar></Topbar>
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
