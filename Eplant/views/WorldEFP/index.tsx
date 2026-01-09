import { StateAction, ViewMetadata } from '@eplant/View'
import { Map } from '@mui/icons-material'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import ColorLensIcon from '@mui/icons-material/ColorLens'

import WorldEFPIcon from './icon'
import { WorldEFPData, WorldEFPState } from './types'
const WorldEFP: ViewMetadata<WorldEFPData, WorldEFPState> = {
  name: 'World-EFP',
  id: 'world-efp',
  icon: () => <WorldEFPIcon></WorldEFPIcon>,
  description: '',
  // TODO: If dark theme is active, use ThumbnailDark
  citation({ gene }) {
    return <div></div>
  },
  actions: [
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
      mutation: (prevState) => {
        if (prevState.maskingEnabled) {
          return {
            ...prevState,
            maskingEnabled: !prevState.maskingEnabled,
          }
        } else {
          return {
            ...prevState,
            maskModalVisible: !prevState.maskModalVisible,
          }
        }
      },
    },
  ] as StateAction<WorldEFPState>[],
}
export default WorldEFP
