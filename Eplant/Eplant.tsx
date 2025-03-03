// import useStateWithStorage from '@eplant/util/useStateWithStorage'

import { useEffect } from 'react'

import { Box, CircularProgress, CssBaseline, useTheme } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { dark, light } from './css/theme'
import { URLStateProvider } from './state/URLStateProvider'
import { ViewContainer } from './UI/Layout/ViewContainer'
import Sidebar, { collapsedSidebarWidth, sidebarWidth } from './UI/Sidebar'
import { useConfig } from './config'
import {
  useActiveGeneId,
  useActiveViewId,
  useDarkMode,
  useGeneticElements,
  usePageLoad,
  useSidebarState,
} from './state'
import { updateColors } from './updateColors'
export type EplantProps = Record<string, never>

/**
 * The main Eplant component. This is the root of the application. It contains the left nav and the layout.
 * @returns {JSX.Element} The rendered Eplant component
 */
const Eplant = () => {
  const [darkMode] = useDarkMode()
  const [isCollapse, setIsCollapse] = useSidebarState()
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [activeViewId, setActiveViewId] = useActiveViewId()
  const [genes, setGenes] = useGeneticElements()
  const theme = useTheme()
  const [globalProgress, loaded] = usePageLoad()
  const config = useConfig()
  useEffect(() => {
    if (loaded) {
      updateColors(theme)
    }
  }, [theme, loaded])

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <CssBaseline />
      <Sidebar />
      <URLStateProvider>
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
      </URLStateProvider>
    </ThemeProvider>
  )
}
export default Eplant
