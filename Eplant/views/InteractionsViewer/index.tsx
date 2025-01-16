import React, { useEffect, useRef, useState } from 'react'
import cytoscape, { Core } from 'cytoscape'
// @ts-expect-error addon typing error no fix, still works
import automove from 'cytoscape-automove'
// @ts-expect-error addon typing error no fix, still works
import coseBilkent from 'cytoscape-cose-bilkent'
import popper from 'cytoscape-popper'
import tippy, {
  followCursor,
  Instance as TippyInstance,
  Props as TProps,
  sticky,
} from 'tippy.js'

import GeneticElement from '@eplant/GeneticElement'
import {
  useActiveGeneId,
  useGeneticElements,
  useSetGeneticElements,
} from '@eplant/state'
import { ViewDataError } from '@eplant/View/viewData'

import { View, ViewProps } from '../../View'

import Topbar from './components/Topbar'
import { addEdgeListener, addNodeListener } from './scripts/eventHandlers'
import setLayout from './scripts/layout'
import loadInteractions from './scripts/loadInteractions'
import loadSublocalizations from './scripts/loadSublocalizations'
import cytoStyles from './cytoStyles'
import { InteractionsIcon } from './icon'
// import GeneDialog from './GeneDialog'
import {
  InteractionsViewAction,
  InteractionsViewData,
  InteractionsViewState,
  ViewData,
} from './types'

/*--------------------
CYTOSCAPE PLUGIN SETUP
---------------------- */
declare module 'cytoscape-popper' {
  interface PopperInstance extends TippyInstance {}
}

function tippyFactory(ref: { getBoundingClientRect: any }, content: any) {
  // Since tippy constructor requires DOM element/elements, create a placeholder
  const dummyDomEle = document.createElement('div')
  const config: Partial<TProps> = {
    getReferenceClientRect: ref.getBoundingClientRect,
    // touch: add this later for touch screen capablities
    // dom element inside the tippy:
    content: content.content,
    // your own preferences:
    arrow: content.arrow,
    placement: 'left',
    delay: [1000, 1000],
    animation: 'fade',
    followCursor: content.followCursor,
    duration: content.duration,
    sticky: false,
    interactive: content.interactive,
    interactiveBorder: 3,
    appendTo: document.body, // or append dummyDomEle to document.body
    plugins: [followCursor, sticky],
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
    let data: ViewData
    if (gene) {
      const query = gene.id.toUpperCase()
      const url =
        'https://bar.utoronto.ca/eplant/cgi-bin/get_interactions_dapseq.py?locus=' +
        query
      // Fetch interaction data
      let recursive: string = ''
      const interactions = await fetch(url)
        .then((response) => response.json())
        .then((json) => json[query])
        .then((interactions: [] | undefined) => {
          if (interactions === undefined) {
            recursive = 'false'
            return []
          }
          recursive = interactions[interactions.length - 1]
          return interactions.slice(0, interactions.length - 1)
        })
      console.log(performance.now())
      // psosible solutoon: promise chain to combine these two (promise.o)
      data = loadInteractions(gene, interactions, recursive)
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
    const [cyto, setCyto] = useState<Core>(cytoscape())
    const [activeGeneId, setActiveGeneId] = useActiveGeneId()
    const geneticElements = useGeneticElements()
    const setGeneticElements = useSetGeneticElements()
    const cyRef = useRef(null)
    const geneId = geneticElement?.id
    const viewData = activeData.viewData
    const elements: any = [...viewData.nodes, ...viewData.edges]

    useEffect(() => {
      const cy: Core = cytoscape({
        container: document.getElementById('cy'), // container to render in
        elements: elements,
        style: cytoStyles,
      })

      setCyto(cy)
      /*
          AIV.returnSVGandMapManThenChain = function () {
        return $.ajax({
            url: "https://bar.utoronto.ca/interactions2/cgi-bin/suba4.php",
            type: "POST",
            data: JSON.stringify( AIV.returnLocalizationPOSTJSON() ),
            contentType : 'application/json',
            dataType: 'json'
        })
            .then(function(SUBAJSON){
                AIV.addLocalizationDataToNodes(SUBAJSON);

                //Loop through ATG protein nodes and add a SVG string property for bg-image css
                AIV.cy.startBatch();
                AIV.parseProteinNodes(AIV.createSVGPieDonutCartStr.bind(AIV), true);
                AIV.cy.endBatch();
                AIV.effectorsLocHouseCleaning();
                if (!AIV.SUBA4LoadState){
                    AIV.returnBGImageSVGasCSS().update();
                }

                //Update the HTML table with our SUBA data
                AIV.transferLocDataToTable();
                AIV.SUBA4LoadState = true;
            })
            .catch(function(err){
                alertify.logPosition("top right");
                alertify.error(`Error made when requesting to SUBA webservice, status code: ${err.status}`);
            })
            .then(function(){ // chain this AJAX call to the above as the mapman relies on the drawing of the SVG pie donuts, i.e. wait for above sync code to finish
                if (!AIV.mapManLoadState) { //don't make another ajax call if we already have MapMan data in our nodes (this logic is for our checkbox)
                    return $.ajax({
                        url: AIV.createGETMapManURL(),
                        type: 'GET',
                        dataType: 'json'
                    });
                }
            })
            .catch(function(err){
                alertify.logPosition("top right");
                alertify.error(`Error made when requesting to MapMan webservice (note: we cannot load more than 700 MapMan numbers), status code: ${err.status}`);
            })
            .then(function(resMapManJSON){
                if (typeof resMapManJSON !== 'undefined' && resMapManJSON.status === "fail"){ throw new Error ('MapMan server call failed!')}
                AIV.cy.startBatch();
                AIV.processMapMan(resMapManJSON);
                AIV.cy.endBatch();
                AIV.mapManLoadState = true;
            })
            .catch(function(err){
                alertify.logPosition("top right");
                alertify.error(`Error processing MapMan data; ${err}`);
            });
    };
`    */

      setLayout(cy, viewData.loadFlags)
      // Listen for mouseover events on nodes
      addNodeListener(cy)
      // Listen for mouseover events on edges
      addEdgeListener(cy)
      // // add loadgene listener // NOT WORKING
      // const loadGeneButton = document.querySelector("loadGene_interactionsView")
      // loadGeneButton?.addEventListener("click", ()=>{
      //   const id = loadGeneButton.getAttribute("id")
      //   const aliases = loadGeneButton.getAttribute("aliases")?.split(",")
      //   const annotation = loadGeneButton.getAttribute("annotation")
      //   if (id != null && annotation != null && aliases != null) {
      //     const geneticElement = new GeneticElement(
      //         id,
      //         annotation,
      //         arabidopsis,
      //         aliases
      //     )
      //     setGeneticElements([...geneticElements[0], geneticElement])
      //     setActiveGeneId(geneticElement.id)
      //   }
      // })
    }, [])

    /**
     * @function parseProteinNodes - parse through every protein (non-effector) node that exists in the DOM and perform the callback function on each node
     * @param {function} cb -  callback function
     * @param {boolean} [needNodeRef=false] - optional boolean to determine if callback should be performed on node object reference
     */
    const parseProteinNode = (cb: (id: any) => null, needNodeRef = false) => {
      cyto.filter('.protien_back').forEach(function (node) {
        const nodeID = node.data('name')
        if (nodeID.match(/^AT[1-5MC]G\d{5}$/i)) {
          //only get AGI IDs, i.e. exclude effectors
          if (needNodeRef) {
            cb(node)
          } else {
            cb(nodeID)
          }
        }
      })
    }
    // // Add event listner to load gene button
    // const loadGeneButton = document.querySelector('.loadGene_interactionsView')
    // const id = loadGeneButton?.id
    // const annotation = loadGeneButton?.getAttribute('annotation')
    // const aliases = loadGeneButton?.getAttribute('aliases')?.split(',')

    // if (id != null && annotation != null && aliases != null) {
    //   loadGeneButton?.addEventListener('click', (event) => {
    //     const geneticElement = new GeneticElement(
    //       id,
    //       annotation,
    //       arabidopsis,
    //       aliases
    //     )
    //     setGeneticElements([...geneticElements[0], geneticElement])
    //     setActiveGeneId(id)
    //   })
    // }

    return (
      <div style={{ background: 'white', overflow: 'hidden' }}>
        <Topbar cy={cyto} gene={geneId === undefined ? '' : geneId}></Topbar>
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
