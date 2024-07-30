// -------
// IMPORTS
// -------
import React, { FC, useState } from 'react'
import { Space } from 'react-zoomable-ui/dist/Space'

import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import useTheme from '@mui/material/styles/useTheme'
import Tooltip from '@mui/material/Tooltip'

//----------
// Types
//----------
interface ZoomControlsProps {
  spaceRef: React.MutableRefObject<Space | null>
  scale: number
}
//----------
// COMPONENT
//----------
const ZoomControls: FC<ZoomControlsProps> = ({ spaceRef, scale }) => {
  const [resetZoomMessage, setResetZoomMessage] = useState('Click to reset')
  const theme = useTheme()

  return (
    <ButtonGroup
      variant='outlined'
      sx={{
        position: 'relative',
        float: 'right',
        zIndex: 1000,
        background: theme.palette.background.paper,
      }}
    >
      {/* RESET BUTTON */}
      <Tooltip title={resetZoomMessage} arrow>
        <Button
          color='secondary'
          onClick={() => {
            spaceRef.current?.viewPort?.camera.recenter(350, 200, 0.7)
            setResetZoomMessage('Zoom reset!')
            setTimeout(() => {
              setResetZoomMessage('Click to reset')
            }, 2000)
          }}
          sx={{
            color: scale == 1000 - 0.3 ? 'red' : scale < 0.46 ? 'red' : 'white',
          }}
        >
          {(scale * 100 + 30).toFixed(0)}%
        </Button>
      </Tooltip>
      {/* ZOOM IN BUTTON */}
      <Tooltip
        title={scale >= 1000 - 0.3 ? 'Maximum zoom reached!' : 'Zoom in'}
        arrow
      >
        <Button
          size='medium'
          color='secondary'
          sx={{
            minWidth: '25px',
            padding: '2px',
          }}
          onClick={() => spaceRef.current?.viewPort?.camera.moveBy(0, 0, 0.1)}
        >
          <Add />
        </Button>
      </Tooltip>
      {/* ZOOM OUT BUTTON */}
      <Tooltip
        title={scale * 100 + 30 < 76 ? 'Minimum zoom reached!' : 'Zoom out'}
        arrow
      >
        <Button
          size='medium'
          color='secondary'
          sx={{
            minWidth: '25px',
            padding: '2px',
          }}
          onClick={() => spaceRef.current?.viewPort?.camera.moveBy(0, 0, -0.1)}
        >
          <Remove />
        </Button>
      </Tooltip>
    </ButtonGroup>
  )
}

export default ZoomControls
