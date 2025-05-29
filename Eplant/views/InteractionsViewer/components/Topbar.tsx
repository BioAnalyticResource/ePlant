import { ChangeEvent, FC, useRef, useState } from 'react'
import { Core } from 'cytoscape'

import { FilterAlt, QuestionMark } from '@mui/icons-material'
import { Close } from '@mui/icons-material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import {
  applyFilter,
  cleanCompoundNode,
  cleanNodes,
} from '../scripts/filterLogic'

import NumberInput from './NumberInput'

interface TopbarProps {
  cy: Core
  gene: string
}
/** Interactions view toolbar, contains gene id header, legend and filter buttons
 * @param {Core} cy cytoscape instance
 * @param {string} gene current gene id
 *  */
const Topbar: FC<TopbarProps> = ({ cy, gene }) => {
  const [showLegend, setShowLegend] = useState<boolean>(false)
  const legendRef = useRef(null)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const filterRef = useRef(null)
  const [eppiSelected, setEppiSelected] = useState<boolean>(false)
  const [eppiCorrSelected, setEppiCorrSelected] = useState<boolean>(false)
  const [eppiCorrValue, setEppiCorrValue] = useState<number>()
  const [pppiSelected, setPppiSelected] = useState<boolean>(false)
  const [pppiCorrSelected, setPppiCorrSelected] = useState<boolean>(false)
  const [pppiCorrValue, setPppiCorrValue] = useState<number>()
  const [pppiConfSelected, setPppiConfSelected] = useState<boolean>(false)
  const [pppiConfValue, setPppiConfValue] = useState<number>()
  const [epdiSelected, setEpdiSelected] = useState<boolean>(false)
  const [ppdiSelected, setPpdiSelected] = useState<boolean>(false)
  const [ppdiConfSelected, setPpdiConfSelected] = useState<boolean>(false)
  const [ppdiConfValue, setPpdiConfValue] = useState<number>()

  const selectors = {
    EPPISelector: '[type = "PPI"][method = "E"]', // checkbox
    corrSelector: '[correlation <= ', // eppi-correlation spinner + checkbox
    PPPISelector: '[type = "PPI"][method = "P"]', // checkbox
    interConfSelector: '[interolog_conf <=', // PPPI correlation
    EPDISelector: '[type = "PDI"][method = "E"]',
    PPDISelector: '[type = "PDI"][method = "P"]',
    fimoConfSelector: '[fimo_conf >= ',
  }

  const handleLegendClick = () => {
    setShowLegend(!showLegend)
  }
  const handleFilterClick = () => {
    setShowFilters(!showFilters)
  }
  const handleApplyFilters = () => {
    const filterStatus = [
      eppiSelected,
      eppiCorrSelected,
      pppiSelected,
      pppiCorrSelected,
      pppiConfSelected,
      epdiSelected,
      ppdiSelected,
      ppdiConfSelected,
    ]

    // Create selectors
    const eppiCorr =
      selectors.EPPISelector + selectors.corrSelector + eppiCorrValue + ']'
    const pppiCorr =
      selectors.PPPISelector + selectors.corrSelector + pppiCorrValue + ']'
    const pppiConf =
      selectors.PPPISelector + selectors.interConfSelector + pppiConfValue + ']'
    const ppdiConf =
      selectors.PPDISelector +
      selectors.fimoConfSelector +
      '1e-' +
      ppdiConfValue +
      ']'

    const filters = [
      selectors.EPPISelector,
      eppiCorr,
      selectors.PPPISelector,
      pppiCorr,
      pppiConf,
      selectors.EPDISelector,
      selectors.PPDISelector,
      ppdiConf,
    ]
    // @ts-expect-error error with show no fix, still works
    cy.elements().show()
    for (let i = 0; i < filterStatus.length; i++) {
      console.log(i)
      applyFilter(cy, filterStatus[i], filters[i])
    }
    // Hide orphaned nodes
    cleanNodes(cy)
    // Hide parent nodes
    cleanCompoundNode(cy, 'COMPOUND_DNA')
    cleanCompoundNode(cy, 'COMPOUND_PROTEIN')
    // close filter dialog
    setShowFilters(false)
  }

  return (
    <AppBar position='sticky' color='default' sx={{ overflow: 'overlay' }}>
      <Toolbar variant='regular' sx={{ flexWrap: 'wrap' }}>
        {/* VIEW TITLE */}
        <Typography variant='h6' sx={{ flexGrow: 2 }}>
          ID: {gene}
        </Typography>
        <ButtonGroup variant='outlined' sx={{}}>
          {/* LEGEND BUTTON */}
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
          {/* FILTER BUTTON */}
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
      {/* LEGEND WINDOW */}
      <Popover
        open={showLegend}
        onClose={() => {
          setShowLegend(!showLegend)
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        anchorEl={legendRef.current}
      >
        <Box sx={{ zIndex: 120, display: 'flex', flexDirection: 'column' }}>
          <IconButton
            sx={{ position: 'absolute', right: 0 }}
            color='secondary'
            size='small'
            onClick={handleLegendClick}
          >
            <Close />
          </IconButton>
          <img src='thumbnails/legendAIV.png' width={200}></img>
        </Box>
      </Popover>
      {/* FILTERS DIALOG WINDOW */}
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
          {/* TITLE BAR OF FILTER DIALOG */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant='h4'>Filter Interactions</Typography>
            <IconButton color='secondary' onClick={handleFilterClick}>
              <Close />
            </IconButton>
          </Box>
          {/* FORM OPTIONS FOR FILTER DIALOG */}
          <FormGroup>
            {/* FILTER: EPPI - Experimentally Determined Protein-Protein Interactions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={eppiSelected}
                  onChange={() => setEppiSelected(!eppiSelected)}
                />
              }
              label='Hide ALL experimentally determined Protein-Protein interactions'
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', ml: 3 }}>
              {/* FILTER (Checkbox) - EPPI Correlation */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eppiCorrSelected}
                    onChange={() => setEppiCorrSelected(!eppiCorrSelected)}
                  />
                }
                label='Hide only with correlation less than: '
              />
              {/* FILTER (Number Select) - EPPI Correlation*/}
              {eppiCorrSelected && (
                <NumberInput
                  label='correlation'
                  changeFunc={(event: ChangeEvent) => {
                    const target = event.target as HTMLInputElement
                    let value = parseFloat(target.value)
                    if (value > 1) {
                      value = 1
                    } else if (value < -1) {
                      value = -1
                    }
                    setEppiCorrValue(value)
                  }}
                />
              )}
            </Box>
            {/* FILTER: Predicted Protein-Protein Interactions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={pppiSelected}
                  onChange={() => setPppiSelected(!pppiSelected)}
                />
              }
              label='Hide ALL predicted Protein-Protein interactions'
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', ml: 3 }}>
              {/* FILTER (Checkbox) - PPPI Correlation*/}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pppiCorrSelected}
                    onChange={() => setPppiCorrSelected(!pppiCorrSelected)}
                  />
                }
                label='Hide only with correlation less than: '
              />
              {/* FILTER (Number Select) - PPPI Correlation*/}
              {pppiCorrSelected && (
                <NumberInput
                  label='correlation'
                  changeFunc={(event: ChangeEvent) => {
                    const target = event.target as HTMLInputElement
                    let value = parseFloat(target.value)
                    if (value > 1) {
                      value = 1
                    } else if (value < -1) {
                      value = -1
                    }
                    setPppiCorrValue(value)
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', ml: 3 }}>
              {/* FILTER (Checkbox) - PPPI Confidence*/}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pppiConfSelected}
                    onChange={() => setPppiConfSelected(!pppiConfSelected)}
                  />
                }
                label='Hide only with confidence less than: '
              />
              {/* FILTER (Number Select) - PPPI Confidence*/}
              {pppiConfSelected && (
                <NumberInput
                  label='confidence'
                  changeFunc={(event: ChangeEvent) => {
                    const target = event.target as HTMLInputElement
                    let value = parseFloat(target.value)
                    if (value > 1) {
                      value = 1
                    } else if (value < -1) {
                      value = -1
                    }
                    setEppiCorrValue(value)
                  }}
                />
              )}
            </Box>

            {/* FILTER: Experimentally determined Protein-DNA Interactions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={epdiSelected}
                  onChange={() => setEpdiSelected(!epdiSelected)}
                />
              }
              label='Hide ALL experimentally  determined Protein-DNA interactions'
            />
            {/* FILTER: Predicted Protien-DNA Interactions*/}
            <FormControlLabel
              control={
                <Checkbox
                  checked={ppdiSelected}
                  onChange={() => setPpdiSelected(!ppdiSelected)}
                />
              }
              label='Hide ALL predicted Protien-DNA interactions'
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', ml: 3 }}>
              {/* FILTER (Checkbox) - PPDI Confidence*/}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ppdiConfSelected}
                    onChange={() => setPpdiConfSelected(!ppdiConfSelected)}
                  />
                }
                label='Hide only with confidence greater than'
              />
              {/* FILTER (Number Select) - PPDI Confidence*/}
              {ppdiConfSelected && (
                <NumberInput
                  label='confidence'
                  changeFunc={(event: ChangeEvent) => {
                    const target = event.target as HTMLInputElement
                    let value = parseFloat(target.value)
                    if (value > 1) {
                      value = 1
                    } else if (value < -1) {
                      value = -1
                    }
                    setPpdiConfValue(value)
                  }}
                  prefix='1e-'
                />
              )}
            </Box>
            {/* APPLY FILTERS BUTTON */}
            <Button
              sx={(theme) => ({
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              })}
              type='submit'
              onClick={handleApplyFilters}
              variant='contained'
            >
              Apply filters
            </Button>
          </FormGroup>
        </Box>
      </Popover>
    </AppBar>
  )
}

export default Topbar
