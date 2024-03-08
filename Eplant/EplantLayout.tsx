import { useEffect } from 'react'

import { Box, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { ViewContainer } from './UI/Layout/ViewContainer'
import { sidebarWidth } from './UI/Sidebar'
import FallbackView from './views/FallbackView'
import { useConfig } from './config'
import {
  useActiveGeneId,
  useActiveViewId,
  useGeneticElements,
  usePageLoad,
} from './state'
import { updateColors } from './updateColors'

const EplantLayout = () => {
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [activeViewId, setActiveViewId] = useActiveViewId()

  const [genes] = useGeneticElements()
  const theme = useTheme()
  const [globalProgress, loaded] = usePageLoad()
  const config = useConfig()
  useEffect(() => {
    if (loaded) {
      updateColors(theme)
    }
  }, [theme, loaded])

  return (
    <Box
      sx={(theme) => ({
        height: `calc(100% - ${theme.spacing(1)})`,
        left: `${sidebarWidth}px`,
        right: '0px',
        position: 'absolute',
        margin: theme.spacing(1),
        boxSizing: 'border-box',
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
        {loaded ? (
          <ViewContainer
            gene={genes.find((gene) => gene.id === activeGeneId) ?? null}
            view={
              config.views.find(
                (view) => view.id === (activeViewId ?? config.defaultView)
              ) ?? FallbackView
            }
            setView={(view) => {
              setActiveViewId(view.id)
            }}
            sx={{
              width: '100%',
              height: '100%',
            }}
          />
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
  )
}
export default EplantLayout
