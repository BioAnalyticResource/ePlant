import { FC, useRef, useState } from 'react'
import { Core } from 'cytoscape'

import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup'
import { Close, FilterAlt, QuestionMark } from '@mui/icons-material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import FilterDialog from './FilterDialog.1'

interface TopbarProps {
  cy: Core
  gene: string
}

const Topbar: FC<TopbarProps> = ({ cy, gene }) => {
  const [showLegend, setShowLegend] = useState<boolean>(false)
  const legendRef = useRef(null)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const filterRef = useRef(null)

  const handleLegendClick = () => {
    setShowLegend(!showLegend)
  }
  const handleFilterClick = () => {
    setShowFilters(!showFilters)
  }
  return (
    <AppBar position='sticky' color='default' sx={{ overflow: 'overlay' }}>
      <Toolbar variant='regular' sx={{ flexWrap: 'wrap', pb: 1 }}>
        {/* VIEW TITLE */}
        <Typography variant='h6' sx={{ flexGrow: 2 }}>
          Interactions Viewer: {gene}
        </Typography>
        <ButtonGroup variant='outlined' sx={{}}>
          <Button
            ref={legendRef}
            size='medium'
            color='secondary'
            title='Legend'
            sx={{
              minWidth: '25px',
              padding: '2px',
            }}
            onClick={handleLegendClick}
          >
            <QuestionMark />
          </Button>
          <Button
            ref={filterRef}
            size='medium'
            color='secondary'
            title='Filter'
            sx={{
              minWidth: '25px',
              padding: '2px',
            }}
            onClick={handleFilterClick}
          >
            <FilterAlt />
          </Button>
        </ButtonGroup>
      </Toolbar>
      <Popup open={showLegend} anchor={legendRef.current}>
        <Box sx={{ zIndex: 120 }}>
          <img src='thumbnails/legendAIV.png' width={200}></img>
        </Box>
      </Popup>
      <Popover
        open={showFilters}
        onClose={() => {
          setShowFilters(!showFilters)
        }}
        anchorEl={filterRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box
          sx={(theme) => ({
            maxWidth: 600,
            padding: 4,
            pt: 2,
            bgcolor: theme.palette.background.transparentOverlay,
            color: 'white',
          })}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant='h4'>Filter Data</Typography>
            <IconButton color='secondary' onClick={handleFilterClick}>
              <Close />
            </IconButton>
          </Box>
          <FilterDialog cy={cy} />
        </Box>
      </Popover>
    </AppBar>
  )
}

export default Topbar
