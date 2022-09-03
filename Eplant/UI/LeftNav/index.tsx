import { useDarkMode, usePanesDispatch, useSpecies } from '@eplant/state'
import {
  Box,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  Typography,
} from '@mui/material'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { SearchGroup } from './GeneSearch'
import { LogoWithText } from '../Logo'
import { useGeneticElements } from '@eplant/state'
import GeneticElementComponent from '../GeneticElementComponent'
import { Collections } from './Collections'
import GeneticElement from '@eplant/GeneticElement'
import _, { uniq } from 'lodash'
import { Settings } from '@mui/icons-material'

/**
 * The left nav bar in ePlant. Contains a search bar, and list of collections of genes.
 * @param props.onSelectGene A function that is called when a new gene is selected
 * @param props.selectedGene The currently selected gene
 * @returns
 */
export function LeftNav(props: {
  onSelectGene?: (gene: GeneticElement) => void
  selectedGene?: string
}) {
  const [species, setSpecies] = useSpecies()
  const [geneticElements, setGeneticElements] = useGeneticElements()
  const [darkMode, setDarkMode] = useDarkMode()
  const panesDispatch = usePanesDispatch()
  React.useEffect(() => {
    const uniq = _.uniqBy(geneticElements, (g) => g.id)
    if (uniq.length != geneticElements.length) setGeneticElements(uniq)
  }, [geneticElements])
  const openSettings = React.useCallback(() => {
    panesDispatch({ type: 'new', id: 'settings', activeGene: null })
    panesDispatch({ type: 'set-view', id: 'settings', view: 'settings' })
  }, [])
  return (
    <Stack gap={4} direction="column" height={'100%'}>
      <LogoWithText text="ePlant" />
      <SearchGroup
        addGeneticElements={(s) => {
          setGeneticElements(
            geneticElements.concat(
              _.uniqBy(
                s.filter(
                  (g) => !geneticElements.find((gene) => g.id == gene.id)
                ),
                (a) => a.id
              )
            )
          )
        }}
      />
      <Divider light />
      <Collections
        onSelectGene={props.onSelectGene}
        selectedGene={props.selectedGene}
      />
      <Box flexGrow={1} />
      <Stack direction="row" alignItems="center">
        <IconButton onClick={openSettings}>
          <Settings />
        </IconButton>
        <Typography>Settings</Typography>
      </Stack>
    </Stack>
  )
}
