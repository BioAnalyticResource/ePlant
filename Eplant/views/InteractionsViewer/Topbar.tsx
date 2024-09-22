import { FC, useRef, useState } from 'react'

import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup'
import { Filter, FilterAlt, QuestionMark } from '@mui/icons-material'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { ListItemText, ListSubheader, Switch } from '@mui/material'

interface TopbarProps {
  gene: string
}

const Topbar: FC<TopbarProps> = ({ gene }) => {
  const [showLegend, setShowLegend] = useState<boolean>(false)
  const legendRef = useRef(null)
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const filterRef = useRef(null)

  const zoomValue = 1000

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
        <Box sx={{zIndex: 120}}>
          <img src='thumbnails/legendAIV.png' width={200}></img>
        </Box>
      </Popup>
      <Popup open={showFilter} anchor={filterRef.current}>
        <Box>
          <List
            sx={(theme) => ({
              maxWidth: 360,
              bgcolor: theme.palette.background.default,
            })}
            subheader={<ListSubheader>Filter Interactions</ListSubheader>}
          >
            <ListItem>
              <ListItemText
                id='filter-option-1'
                primary='Hide ALL experimentally determined Protein-Protein interactions'
              />
              <Switch
                edge='end'
                onChange={() => {}}
                checked={false}

              />
            </ListItem>
            <ListItem>
              <ListItemText id='filter-option-2' primary='Hide only with correlation less than: 0.5 ' />
              <Switch
                edge='end'
                onChange={() => {}}
                checked={false}

              />
            </ListItem>
            <ListItem>
              <ListItemText id='filter-option-3' primary='Hide ALL predicted
            Protein-Protein interactions Hide only with correlation less than:
            0.5' />
              <Switch
                edge='end'
                onChange={() => {}}
                checked={false}

              />
            </ListItem>
            <ListItem>
              <ListItemText id='filter-option-4' primary='Hide only with confidence less than 2' />
              <Switch
                edge='end'
                onChange={() => {}}
                checked={false}

              />
            </ListItem>
            <ListItem>
              <ListItemText id='filter-option-5' primary='Hide only with confidence less than 2' />
              <Switch
                edge='end'
                onChange={() => {}}
                checked={false}

              />
            </ListItem>
          </List>
        </Box>
      </Popup>
    </AppBar>
  )
}

export default Topbar
