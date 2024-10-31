import { StateActions } from '@eplant/util/stateUtils'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'

import { CellEFPViewerState } from './types'

export const CellEFPStateActions: StateActions<CellEFPViewerState> = {
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
}
