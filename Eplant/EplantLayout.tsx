import { useEffect, useRef, useState } from 'react'

import { Add, CallMade, Close } from '@mui/icons-material'
import { Box, CircularProgress, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import TabsetPlaceholder from './UI/Layout/TabsetPlaceholder'
import { ViewContainer } from './UI/Layout/ViewContainer'
import { sidebarWidth } from './UI/Sidebar'
import { useConfig } from './config'
import GeneticElement from './GeneticElement'
import { defaultConfig } from './main'
import { useActiveId, usePageLoad } from './state'
import { updateColors } from './updateColors'
import { View } from './View'

const EplantLayout = () => {
  const [activeGene, setActiveGene] = useState<GeneticElement | null>(null)
  const [activeView, setActiveView] = useState<View>(
    defaultConfig.views.find((v) => v.id == defaultConfig.defaultView) as View
  )
  const [activeId, setActiveId] = useActiveId()
  const theme = useTheme()
  const [globalProgress, loaded] = usePageLoad()

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
            gene={activeGene}
            view={activeView}
            setView={setActiveView}
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
