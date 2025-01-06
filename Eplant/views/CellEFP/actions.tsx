import { StateAction } from '@eplant/View'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'

import { CellEFPViewerState } from './types'

export const CellEFPStateActions: StateAction<CellEFPViewerState>[] = [
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
]
