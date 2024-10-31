import { StateActions } from '@eplant/util/stateUtils'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import SettingsIcon from '@mui/icons-material/Settings'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'

import { EFPId } from '../types'

import { EFPViewerSortTypes, EFPViewerState } from './types'
export const EFPViewerActions: StateActions<EFPViewerState> = {
  'Reset Pan/Zoom': {
    icon: <YoutubeSearchedForRoundedIcon />,
    mutation: (prevState) => ({
      ...prevState,
      transform: {
        offset: {
          x: 0,
          y: 0,
        },
        zoom: 1,
      },
    }),
    rendered: true,
  },
  'Toggle Color Mode': {
    icon: <ColorLensIcon />,
    mutation: (prevState) => ({
      ...prevState,
      colorMode: prevState.colorMode == 'absolute' ? 'relative' : 'absolute',
    }),
    rendered: true,
  },
  'Set Transform': {
    mutation: (prevState, transform) => ({
      ...prevState,
      transform: transform,
    }),
    rendered: false,
  },
  'Set Mask Threshold': {
    mutation: (prevState, threshold) => ({
      ...prevState,
      maskThreshold: threshold,
    }),
    rendered: false,
  },
  'Sort by': {
    mutation: (prevState, sortby: EFPViewerSortTypes) => ({
      ...prevState,
      sortBy: sortby,
    }),
    rendered: false,
  },
  'Set Active View': {
    mutation: (prevState, activeView: EFPId) => ({
      ...prevState,
      activeView: activeView,
    }),
    rendered: false,
  },
}
