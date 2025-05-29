import { useEffect, useRef, useState } from 'react'
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
import { ViewDataError, ViewMetadata } from '@eplant/View/'
import Close from '@mui/icons-material/Close'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'
import { useTheme } from '@mui/material'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'

import Topbar from './components/Topbar'
import { addEdgeListener, addNodeListener } from './scripts/eventHandlers'
import setLayout from './scripts/layout'
import loadInteractions from './scripts/loadInteractions'
import cytoStyles from './cytoStyles'
import { InteractionsIcon } from './icon'
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

/**
 * Creates a Tippy.js tooltip instance.
 * Note: tried to make a seperate type for content, but it was causing a bunch of errors so switched to any and added contnet object keys to jsdoc
 * @param {Object} ref - Reference to the element for which the tooltip is created.
 * @param {Function} ref.getBoundingClientRect - neccessary for proper typing
 * @param {Object} content - Content and configuration for the tooltip.
 * @param {string | HTMLElement} content.content - The content to display inside the tooltip.
 * @param {boolean} content.arrow - Whether to display an arrow on the tooltip.
 * @param {boolean} content.followCursor - Whether the tooltip should follow the cursor.
 * @param {number | [number, number]} content.delay - Delay in showing and hiding the tooltip.
 * @param {string} content.animation - The animation type for the tooltip.
 * @param {number} content.duration - Duration of the tooltip animation.
 * @param {boolean} content.interactive - Whether the tooltip is interactive.
 * @param {number} content.interactiveBorder - The size of the border around the tooltip where interaction is allowed.
 * @returns {Tooltip} Returns a tooltip instance.
 */
function createTooltip(ref: { getBoundingClientRect: any }, content: any) {
  // Since tooltip constructor requires DOM element/elements, create a placeholder
  const dummyDomElement = document.createElement('div')
  const config: Partial<TProps> = {
    getReferenceClientRect: ref.getBoundingClientRect,
    // touch: add this later for touch screen capabilities
    // DOM element inside the tooltip:
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
  const tip = tippy(dummyDomElement, config)
  return tip
}

cytoscape.use(popper(createTooltip))
cytoscape.use(automove)
cytoscape.use(coseBilkent)
/* -------------------------------- */
declare module '@mui/material/IconButton' {
  interface ButtonPropsColorOverrides {
    custom: true
  }
}
const InteractionsViewer: ViewMetadata<InteractionsViewData, InteractionsViewState> = {
  name: 'Interactions Viewer',
  id: 'interactions-viewer',

  icon: () => <InteractionsIcon />,
  description: 'Interactions Viewer.',
  citation() {
    return <div></div>
  },
  actions: [
    { 
      name: 'Reset Pan/Zoom',
      description: 'Reset the pan and zoom of the viewer',
      icon: <YoutubeSearchedForRoundedIcon />,
      mutation: (prevState) => ({
        ...prevState,
        transform: {
          offset: {
            x: 500,
            y: 320,
          },
          zoom: 1,
        },
      }),
    },
  ]
}


export default InteractionsViewer


  