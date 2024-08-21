import React, { useEffect, useRef } from 'react'
import { Core } from 'cytoscape'

import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const Topbar = () => {

  const zoomValue = 1000.0
  return (
    <AppBar position='sticky' color='default' sx={{ overflow: 'overlay' }}>
      <Toolbar variant='dense'>
        {/* VIEW TITLE */}
        <Typography variant='h6' sx={{ flexGrow: 1 }}>
          Interactions Viewer
        </Typography>
        {/* ZOOM CONTROLS */}
        <Typography
          variant='caption'
          sx={{
            color:
              zoomValue == 1000 ? 'red' : zoomValue < 0.46 ? 'red' : 'white',
          }}
        >
          {/* (zoom value).toFixed(0) */}
        </Typography>
        <ButtonGroup variant='outlined' sx={{ marginLeft: '5px' }}>
          <Button
            size='medium'
            color='secondary'
            title='Zoom in'
            sx={{
              minWidth: '25px',
              padding: '2px',
            }}
            onClick={
              () => {}
              // zoom in
            }
          >
            <Add />
          </Button>
          <Button
            size='medium'
            color='secondary'
            title='Zoom out'
            sx={{
              minWidth: '25px',
              padding: '2px',
            }}
            onClick={
              () => {}
              // zoom out
            }
          >
            <Remove />
          </Button>
        </ButtonGroup>
        <Button
          color='secondary'
          title='Reset zoom'
          onClick={
            () => {}
            //   reset zoom
          }
        >
          Reset
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar
