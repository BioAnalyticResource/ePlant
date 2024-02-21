import * as React from 'react'
import { useContext } from 'react'
import _ from 'lodash'

import { collapseContext } from '@eplant/Eplant'
import GeneticElement from '@eplant/GeneticElement'
import {
  useActiveId,
  useDarkMode,
  useGeneticElements,
  usePanesDispatch,
} from '@eplant/state'
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import ArrowRight from '@mui/icons-material/ArrowRight';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';
import { Box, FormControlLabel, FormGroup, Switch } from '@mui/material'
import Stack from '@mui/material/Stack'

import { LogoWithText } from '../Logo'

import { Collections } from './Collections'
import { SearchGroup } from './GeneSearch'

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

  const context = useContext(collapseContext)
  const collapse = context.collapse
  const setCollapse = context.setCollapse


  const toggleCollapse = () => {
    setCollapse(!collapse)
  }

  const panesDispatch = usePanesDispatch()
  const activeID = useActiveId()[0]

  React.useEffect(() => {
    const uniq = _.uniqBy(geneticElements, (g) => g.id)
    if (uniq.length != geneticElements.length) setGeneticElements(uniq)
  }, [geneticElements])
  return (
    <Stack gap={2} direction='column' height={'100%'}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {!collapse ? <LogoWithText text='ePlant' /> : <LogoWithText text='' />}
        <button style={
          !collapse ? { backgroundColor: 'transparent', border: 'none', transform: 'translateX(+20%)' } : { backgroundColor: 'transparent', border: 'none', transform: 'translateX(-30%)', transition: 'all 1s ease-out' }
        } onClick={() => toggleCollapse()}>
          {collapse ? <ArrowRight sx={
            { '&:hover': { cursor: 'pointer', transform: 'scale(1.5)' } }
          } color='primary' /> : <ArrowLeft sx={
            { '&:hover': { cursor: 'pointer', transform: 'scale(1.5)' } }
          } color='primary' />}
        </button>
      </div>
      {!collapse && <><SearchGroup
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
        /> </>}

      {collapse && <>
        <div onClick={() => setCollapse(false)} style={{ marginLeft: '10px' }}>
          <SearchIcon sx={{ '&:hover': { cursor: 'pointer', transform: 'scale(1.1)' } }} />
        </div>
      </>}
      <Box flexGrow={1} />
      {/* <FormGroup>
        <FormControlLabel
          control={
            <Switch
              onChange={(v) => setDarkMode(v.target.checked)}
              checked={darkMode}
            />
          }
          label='Dark mode'
        />
      </FormGroup> */}
      <div style={{ display: 'flex', justifyContent: 'center' }} onClick={() => setDarkMode(!darkMode)}>
        <DarkModeIcon sx={darkMode ? { '&:hover': { cursor: 'pointer', color: 'white', transform: 'scale(1.1)' } } : { '&:hover': { cursor: 'pointer', color: 'black', transform: 'scale(1.1)' } }} color={darkMode ? 'primary' : 'secondary'} />
      </div>
    </Stack>
  )
}
