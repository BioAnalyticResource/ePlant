import { FC, useRef, useState } from 'react'

import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup'
import { Filter, FilterAlt, QuestionMark } from '@mui/icons-material'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { ListItemText, ListSubheader, Switch } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import FilterDialog from './FilterDialog'

interface TopbarProps {
  gene: string
}

const Topbar: FC<TopbarProps> = ({ gene }) => {
  const [showLegend, setShowLegend] = useState<boolean>(false)
  const legendRef = useRef(null)
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const filterRef = useRef(null)
  const selectors = {
    EPPISelector: '[type = "PPI"][method = "E"]', // checkbox
    corrSelector: '[correlation <= ', // eppi-correlation spinner + checkbox
    PPPISelector: '[type = "PPI"][method = "P"]', // checkbox
    interConfSelector: '[interolog_conf <=', // PPPI correlation
    EPDISelector: '[type = "PDI"][method = "E"]',
    PPDISelector: '[type = "PDI"][method = "P"]',
    fimoConfSelector: '[fimo_conf >= ',
  }
  const zoomValue = 1000

  const applyFilters = () => {
    // Create selectors
    const eppiCorr =
      selectors.EPPISelector + selectors.corrSelector + EPPICorrValue + ']'
    const pppiCorr =
      selectors.PPPISelector + selectors.corrSelector + PPPICorrValue + ']'
    const pppiConf =
      selectors.PPPISelector + selectors.interConfSelector + PPPIConfValue + ']'
    const ppdiConf =
      selectors.PPDISelector + selectors.fimoConfSelector + PPDIConfValue + ']'
  }
  const handleLegendClick = () => {
    setShowLegend(!showLegend)
  }
  const handleFilterClick = () => {
    setShowFilter(!showFilter)
  }
  return (
    <AppBar position='sticky' color='default' sx={{ overflow: 'overlay' }}>
      <Toolbar variant='dense'>
        {/* VIEW TITLE */}
        <Typography variant='h6' sx={{ flexGrow: 0.6 }}>
          Interactions Viewer: {gene}
        </Typography>
        <ButtonGroup variant='outlined' sx={{ marginLeft: '300px' }}>
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
      <Popup open={showFilter} anchor={filterRef.current}>
        <FilterDialog />
      </Popup>
    </AppBar>
  )
}

export default Topbar
