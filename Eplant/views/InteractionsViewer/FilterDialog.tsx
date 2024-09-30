import { FC, useState } from 'react'

import { ListItemText, ListSubheader, Switch } from '@mui/material'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

export const FilterDialog: FC = () => {
  const [EPPICorrValue, setEPPICorrValue] = useState<number>()
  const [PPPICorrValue, setPPPICorrValue] = useState<number>()
  const [PPPIConfValue, setPPPIConfValue] = useState<number>()
  const [PPDIConfValue, setPPDIConfValue] = useState<number>()
  const selectors = {
    EPPISelector: '[type = "PPI"][method = "E"]', // checkbox
    corrSelector: '[correlation <= ', // eppi-correlation spinner + checkbox
    PPPISelector: '[type = "PPI"][method = "P"]', // checkbox
    interConfSelector: '[interolog_conf <=', // PPPI correlation
    EPDISelector: '[type = "PDI"][method = "E"]',
    PPDISelector: '[type = "PDI"][method = "P"]',
    fimoConfSelector: '[fimo_conf >= ',
  }

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

  return (
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
          <Switch edge='end' onChange={() => {}} checked={false} />
        </ListItem>
        <ListItem>
          <ListItemText
            id='filter-option-2'
            primary='Hide only with correlation less than: 0.5 '
          />
          <Switch edge='end' onChange={() => {}} checked={false} />
        </ListItem>
        <ListItem>
          <ListItemText
            id='filter-option-3'
            primary='Hide ALL predicted
            Protein-Protein interactions Hide only with correlation less than:
            0.5'
          />
          <Switch edge='end' onChange={() => {}} checked={false} />
        </ListItem>
        <ListItem>
          <ListItemText
            id='filter-option-4'
            primary='Hide only with confidence less than 2'
          />
          <Switch edge='end' onChange={() => {}} checked={false} />
        </ListItem>
        <ListItem>
          <ListItemText
            id='filter-option-5'
            primary='Hide only with confidence less than 2'
          />
          <Switch edge='end' onChange={() => {}} checked={false} />
        </ListItem>
      </List>
    </Box>
  )
}
