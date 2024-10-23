import { FC, useState } from 'react'
import { Core } from 'cytoscape'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

import {
  applyFilter,
  cleanCompoundNode,
  cleanNodes,
} from './scripts/filterLogic'

interface FilterProps {
  cy: Core
}
type numberInputProps = {
  label: string
  changeFunc: (event: object) => void
  prefix?: string
}
const NumberInput = (props: numberInputProps) => {
  return (
    <>
      <TextField
        label={props.label}
        size='small'
        variant='outlined'
        color='secondary'
        type='number'
        margin='dense'
        onChange={(event) => {
          props.changeFunc(event)
        }}
        inputProps={{
          defaultValue: 0,
          step: 0.1,
          min: -1,
          max: 1,
        }}
        InputProps={
          props.prefix
            ? {
                startAdornment: (
                  <InputAdornment position='start'>
                    {props.prefix}
                  </InputAdornment>
                ),
              }
            : {}
        }
      />
    </>
  )
}
const FilterDialog: FC<FilterProps> = ({ cy }) => {
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

  const applyFilters = () => {}

  const handleSubmit = () => {
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
  }

  return (
    <FormGroup onSubmit={handleSubmit}>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={eppiCorrSelected}
              onChange={() => setEppiCorrSelected(!eppiCorrSelected)}
            />
          }
          label='Hide only with correlation less than: '
        />
        {eppiCorrSelected && (
          <NumberInput
            label='correlation'
            changeFunc={(event) => {
              let value = parseFloat(event.target.value)
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
        {/* pppi (correlation <=) */}
        <FormControlLabel
          control={
            <Checkbox
              checked={pppiCorrSelected}
              onChange={() => setPppiCorrSelected(!pppiCorrSelected)}
            />
          }
          label='Hide only with correlation less than: '
        />
        {/* pppi corr number input */}
        {pppiCorrSelected && (
          <NumberInput
            label='correlation'
            changeFunc={(event) => {
              let value = parseFloat(event.target.value)
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
        {/* pppi (interolog_conf <=)*/}
        <FormControlLabel
          control={
            <Checkbox
              checked={pppiConfSelected}
              onChange={() => setPppiConfSelected(!pppiConfSelected)}
            />
          }
          label='Hide only with confidence less than: '
        />
        {/* pppi conf number input */}
        {pppiConfSelected && (
          <NumberInput
            label='confidence'
            changeFunc={(event) => {
              let value = parseFloat(event.target.value)
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

      <FormControlLabel
        control={
          <Checkbox
            checked={epdiSelected}
            onChange={() => setEpdiSelected(!epdiSelected)}
          />
        }
        label='Hide ALL experimentall determined Protein-DNA interactions'
      />

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
        {/* ppdi (interolog_conf <=)*/}
        <FormControlLabel
          control={
            <Checkbox
              checked={ppdiConfSelected}
              onChange={() => setPpdiConfSelected(!ppdiConfSelected)}
            />
          }
          label='Hide only with confidence greater than'
        />
        {/* ppdi conf number input */}
        {ppdiConfSelected && (
          <NumberInput
            label='confidence'
            changeFunc={(event) => {
              let value = parseFloat(event.target.value)
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
      <Button
        sx={{ mt: 1 }}
        type='submit'
        onClick={handleSubmit}
        variant='contained'
        color='info'
      >
        Apply filters
      </Button>
    </FormGroup>
  )
}
export default FilterDialog
