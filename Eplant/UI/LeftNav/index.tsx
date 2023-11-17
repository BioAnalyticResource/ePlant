import {
  useActiveId,
  useDarkMode,
  usePanesDispatch,
} from '@eplant/state'
import {
  Box,
  FormControlLabel,
  FormGroup,
  Switch,
} from '@mui/material'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { SearchGroup } from './GeneSearch'
import { LogoWithText } from '../Logo'
import { useGeneticElements } from '@eplant/state'
import { Collections } from './Collections'
import GeneticElement from '@eplant/GeneticElement'
import _ from 'lodash'

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
  const [geneticElements, setGeneticElements] = useGeneticElements()
  const [darkMode, setDarkMode] = useDarkMode()

  const panesDispatch = usePanesDispatch()
  const activeID = useActiveId()[0]

  React.useEffect(() => {
    const uniq = _.uniqBy(geneticElements, (g) => g.id)
    if (uniq.length != geneticElements.length) setGeneticElements(uniq)
  }, [geneticElements])
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
          if (s.length > 0) {
            panesDispatch({
              type: 'set-active-gene',
              id: activeID,
              activeGene: s[0].id,
            })
          }
        }}
      />
      <Collections
        onSelectGene={props.onSelectGene}
        selectedGene={props.selectedGene}
      />
      <Box flexGrow={1} />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              onChange={(v) => setDarkMode(v.target.checked)}
              checked={darkMode}
            />
          }
          label="Dark Mode"
        />
      </FormGroup>
    </Stack>
  )
}
