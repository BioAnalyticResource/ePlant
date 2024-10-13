// import useStateWithStorage from '@eplant/util/useStateWithStorage'

import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { Box, CircularProgress, CssBaseline, useTheme } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { dark, light } from './css/theme'
import { ViewContainer } from './UI/Layout/ViewContainer'
import Sidebar, { collapsedSidebarWidth, sidebarWidth } from './UI/Sidebar'
import { ViewDataError } from './View/viewData'
import FallbackView from './views/FallbackView'
import { useConfig } from './config'
import {
  useActiveGeneId,
  useActiveViewId,
  useDarkMode,
  useGeneticElements,
  usePageLoad,
  useSidebarState,
  useSpecies,
} from './state'
import { updateColors } from './updateColors'
export type EplantProps = Record<string, never>

/**
 * The main Eplant component. This is the root of the application. It contains the left nav and the layout.
 * @returns {JSX.Element} The rendered Eplant component
 */
const Eplant = () => {
  const [darkMode] = useDarkMode()
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [activeViewId, setActiveViewId] = useState<string>('')
  const [isCollapse, setIsCollapse] = useSidebarState()
  const [genes, setGenes] = useGeneticElements()
  const theme = useTheme()
  const [globalProgress, loaded] = usePageLoad()
  const config = useConfig()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [speciesList] = useSpecies()
  useEffect(() => {
    if (loaded) {
      updateColors(theme)
    }
  }, [theme, loaded])
  // On app url change, make sure loaded gene and view aligns with URL
  useEffect(() => {
    const loadGene = async (geneid: string) => {
      // TODO: This is super jank, should probably write some better utilities for loading genes
      const species = speciesList.find(
        (species) => species.name === 'Arabidopsis'
      )
      const gene = await species?.api.searchGene(geneid)
      if (gene) {
        setGenes([...genes, gene])
      }
    }
    if (params.geneid) {
      if (params.geneid !== activeGeneId) {
        if (!genes.find((gene) => gene.id === params.geneid)) {
          loadGene(params.geneid)
        }
        setActiveGeneId(params.geneid)
      }
    } else {
      // Set active gene to first available if one is already loaded
      if (genes.length > 0) {
        setActiveGeneId(genes[0].id)
      } else {
        setActiveGeneId('')
      }
    }
    setActiveViewId(location.pathname.split('/')[1])
  }, [location.pathname])

  // On active gene change update the gene path segment
  useEffect(() => {
    if (location.pathname !== import.meta.env.BASE_URL) {
      // Only run this after initial redirect
      const pathSegments = location.pathname.split('/')
      const geneid = activeGeneId ? activeGeneId : ''
      if (pathSegments.length == 3) {
        pathSegments[pathSegments.length - 1] = geneid
      } else if (pathSegments.length == 2) {
        pathSegments.push(geneid)
      }

      const newPath = pathSegments.join('/') + location.search
      if (newPath !== location.pathname + location.search) {
        navigate(newPath)
      }
    }
  }, [activeGeneId, location.pathname])

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <CssBaseline />
      <Sidebar />
      <Box
        sx={(theme) => ({
          height: `calc(100% - ${theme.spacing(1)})`,
          left: `${isCollapse ? collapsedSidebarWidth : sidebarWidth}px`,
          right: '0px',
          position: 'absolute',
          marginTop: '0.5rem',
          boxSizing: 'border-box',
          transition: 'left 1s ease-out',
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'stretch',
          }}
        >
          <div />
          {loaded ? (
            <ViewContainer
              gene={genes.find((gene) => gene.id === activeGeneId) ?? null}
              view={
                config.views.find(
                  (view) => view.id === (activeViewId ?? config.defaultView)
                ) ?? FallbackView
              }
              setView={(viewid) => {
                setActiveViewId(viewid)
              }}
              sx={{
                width: '100%',
                height: '100%',
              }}
            ></ViewContainer>
          ) : (
            <div>
              <CircularProgress
                variant='indeterminate'
                value={globalProgress * 100}
              />
            </div>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  )
}
export default Eplant
