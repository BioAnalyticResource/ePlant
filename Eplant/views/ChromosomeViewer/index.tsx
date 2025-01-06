/**
 * ---------------------
 * view: ChromosomeViewer
 * author: Yonah Aviv
 * modified: 08/01/2024
 * --------------------
 *  */

import React, { useState } from 'react'
import { Space } from 'react-zoomable-ui'

import GeneticElement from '@eplant/GeneticElement'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import SnackbarContent from '@mui/material/SnackbarContent'

import { View } from '../../View'

import ChromosomeView from './Viewer/Viewer'
import { ChromosomeIcon } from './icons'
import {
  ChromosomeItem,
  ChromosomesResponseObj,
  ChromosomeViewerAction,
  ChromosomeViewerData,
  ChromosomeViewerState,
  Transform,
} from './types'
import ZoomControls from './ZoomControls'

export const ChromosomeViewerObject: View<
  ChromosomeViewerData,
  ChromosomeViewerState
> = {
  name: 'Chromosome Viewer',
  id: 'chromosome',
  icon: () => <ChromosomeIcon />,
  description: 'Chromosome Viewer.',
  citation() {
    return (
      <div>
        The Chromosome viewer of ePlant v3 is generated with SVGs using the BAR
        API
      </div>
    )
  },
}
