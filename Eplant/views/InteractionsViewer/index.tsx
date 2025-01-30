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
import { ViewDataError } from '@eplant/View/viewData'
import Close from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'

import { View, ViewProps } from '../../View'

import Topbar from './components/Topbar'
import { addEdgeListener, addNodeListener } from './scripts/eventHandlers'
import setLayout from './scripts/layout'
import loadInteractions from './scripts/loadInteractions'
import cytoStyles from './cytoStyles'
import { InteractionsIcon } from './icon'
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

    if (gene) {
      let recursive: string, interactions: Array<Interaction>
      const query = gene.id.toUpperCase()
      const url =
        'https://bar.utoronto.ca/eplant/cgi-bin/get_interactions_dapseq.py?locus=' +
        query
      try {
        // Fetch interaction data
        const response = await fetch(url)
        const json = await response.json()
        const interactionsData = json[query]

        if (interactionsData === undefined) {
          recursive = 'false'
          interactions = []
        } else {
          // recursive is always the last element in the array
          recursive = interactionsData[interactionsData.length - 1]
          // the interaction are everythign else
          interactions = interactionsData.slice(0, interactionsData.length - 1)
        }
        // Load interactions
        data = loadInteractions(gene, interactions, recursive)

        // Load sublocalizations
        // data.nodes = await loadSublocalizations(data.nodes)
      } catch (error) {
        throw ViewDataError.UNSUPPORTED_GENE
      }
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
    // const [activeGeneId, setActiveGeneId] = useActiveGeneId()
    // const geneticElements = useGeneticElements()
    // const setGeneticElements = useSetGeneticElements()
    const cyRef = useRef(null)
    const geneId = geneticElement?.id
    const viewData = activeData?.viewData || {
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
    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(true)

    useEffect(() => {
      const cy: Core = cytoscape({
        container: document.getElementById('cy'), // container to render in
        elements: elements,
        style: cytoStyles,
      })

      setCyto(cy)

      setLayout(cy, viewData.loadFlags)
      // Listen for mouseover events on nodes
      addNodeListener(cy)
      // Listen for mouseover events on edges
      addEdgeListener(cy)
      // not implemented yet - add loadgene listener (waiting for loadgene atom to be made)
    }, [])

    // Function to close the Snackbar
    const handleCloseSnackbar = () => {
      setSnackbarOpen(false)
    }
    return (
      <div style={{ background: 'white', overflow: 'hidden' }}>
        <Topbar cy={cyto} gene={geneId === undefined ? '' : geneId}></Topbar>
        <div
          ref={cyRef}
          id='cy'
          style={{ width: '100%', height: '80vh' }}
        ></div>
        {/* MUI Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000} // Auto-hide after 5 seconds
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              bottom: '50px',
              right: '24px',
            },
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity='info'
            action={
              <IconButton
                color='inherit'
                title='Close'
                onClick={handleCloseSnackbar} // Close the Snackbar when clicked
              >
                <Close />
              </IconButton>
            }
            sx={{
              width: '300px',
              fontSize: '0.875rem',
              padding: '8px 16px',
              maxHeight: '100px', // Limit height
              overflow: 'auto', // Add scroll if content overflows
            }}
          >
            Are protein localization colours not visible? Interact with the view
            to fix
          </Alert>
        </Snackbar>
      </div>
    )
  },
}
export default InteractionsViewer
