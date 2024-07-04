import { useEffect, useState } from 'react'
import _ from 'lodash'

import GeneticElement from '@eplant/GeneticElement'
import {
  useDarkMode,
  useGeneticElements,
  useSetActiveGeneId,
  useSidebarState,
} from '@eplant/state'
import ArrowLeft from '@mui/icons-material/ArrowLeft'
import ArrowRight from '@mui/icons-material/ArrowRight'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import SearchIcon from '@mui/icons-material/Search'
import { Box, useTheme } from '@mui/material'
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
  const [isCollapse, setIsCollapse] = useSidebarState()

  const theme = useTheme()

  const [tabWidth, setTabWidth] = useState('30px')

  const setActiveGeneId = useSetActiveGeneId()

  useEffect(() => {
    const uniq = _.uniqBy(geneticElements, (g) => g.id)
    if (uniq.length != geneticElements.length) setGeneticElements(uniq)
  }, [geneticElements])
  return (
    <Stack gap={2} direction='column' height={'100%'}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {isCollapse ? <LogoWithText text='' /> : <LogoWithText text='ePlant' />}
        <div
          style={
            isCollapse
              ? {
                  cursor: 'pointer',
                  height: '25px',
                  width: `${tabWidth}`,
                  marginRight: '-39px',
                  backgroundColor: `${theme.palette.primary.main}`,
                  borderRadius: '20px 0px 0px 20px',
                  transform: 'translateX(-30%)',
                  transition: 'all 0.5s ease-out',
                }
              : {
                  cursor: 'pointer',
                  height: '25px',
                  width: `${tabWidth}`,
                  marginRight: '-20px',
                  backgroundColor: `${theme.palette.primary.main}`,
                  borderRadius: '20px 0px 0px 20px',
                  transform: 'translateX(20%)',
                  transition: 'all 0.5s ease-out',
                }
          }
          onClick={() => setIsCollapse(!isCollapse)}
          onMouseEnter={() => setTabWidth('40px')}
          onMouseLeave={() => setTabWidth('30px')}
        >
          {isCollapse ? (
            <ArrowRight
              sx={darkMode ? { color: '#181c18' } : { color: '#f0f7f0' }}
            />
          ) : (
            <ArrowLeft
              sx={darkMode ? { color: '#181c18' } : { color: '#f0f7f0' }}
            />
          )}
        </div>
      </div>
      {!isCollapse && (
        <>
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
                setActiveGeneId(s[0].id)
              }
            }}
          />
          <Collections
            onSelectGene={props.onSelectGene}
            selectedGene={props.selectedGene}
          />{' '}
        </>
      )}

      {isCollapse && (
        <>
          <div
            onClick={() => setIsCollapse(!isCollapse)}
            style={{ marginLeft: '10px' }}
          >
            <SearchIcon
              sx={{ '&:hover': { cursor: 'pointer', transform: 'scale(1.1)' } }}
            />
          </div>
        </>
      )}
      <Box flexGrow={1} />

      <div
        style={{ display: 'flex', justifyContent: 'center' }}
        onClick={() => setDarkMode(!darkMode)}
      >
        <DarkModeIcon
          sx={
            darkMode
              ? {
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'white',
                    transform: 'scale(1.1)',
                  },
                }
              : {
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'black',
                    transform: 'scale(1.1)',
                  },
                }
          }
          color={darkMode ? 'primary' : 'secondary'}
        />
      </div>
    </Stack>
  )
}
