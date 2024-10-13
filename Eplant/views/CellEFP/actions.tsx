import { StateAction } from '@eplant/util/stateUtils'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'

import { CellEFPViewerState } from './types'

export const CellEFPStateActions: StateAction<CellEFPViewerState>[] = [
  {
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
    description: 'Reset Pan/Zoom',
  },
]
