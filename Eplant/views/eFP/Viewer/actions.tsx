import { StateAction } from '@eplant/View'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'

import { EFPViewerState } from './types'
export const EFPViewerActions: StateAction<EFPViewerState>[] = [
  {
    name: 'Reset Pan/Zoom',
    description: 'Reset the pan and zoom of the viewer',
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
  },
  {
    name: 'Toggle Color Mode',
    description: 'Toggle between absolute and relative color modes',
    icon: <ColorLensIcon />,
    mutation: (prevState) => ({
      ...prevState,
      colorMode: prevState.colorMode == 'absolute' ? 'relative' : 'absolute',
    }),
  },
  {
    name: 'Toggle Masking',
    description: 'Toggle colour masking',
    icon: <BuildRoundedIcon />,
    mutation: (prevState) => ({
      ...prevState,
      maskingEnabled: !prevState.maskingEnabled,
      maskModalVisible: prevState.maskingEnabled ? false : true,
    }),
  },
]
