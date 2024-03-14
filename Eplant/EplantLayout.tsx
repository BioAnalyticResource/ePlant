import { useContext, useEffect, useRef, useState } from 'react'
import * as FlexLayout from 'flexlayout-react'
import {
  Actions,
  BorderNode,
  ITabSetRenderValues,
  Layout,
  TabSetNode,
} from 'flexlayout-react'
import { useAtom } from 'jotai'

import { isCollapse as isCollapseState } from '@eplant/Eplant'
import { Add, CallMade, Close } from '@mui/icons-material'
import { Box, CircularProgress, IconButton } from '@mui/material'
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

  //Initializing isCollapse variable to isCollapse jotai atom state
  const [isCollapse] = useAtom(isCollapseState)

  return (
    <Box
      sx={(theme) => ({
        height: `calc(100% - ${theme.spacing(1)})`,
        left: `${isCollapse ? 100 : sidebarWidth}px`,
        right: '0px',
        position: 'absolute',
        marginTop: '0.5rem',
        // margin: theme.spacing(1),
        boxSizing: 'border-box',
        transition: 'all 1s ease-out',
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <Box
        sx={{
          width: '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch',
        }}
      >
        <div style={{ color: 'red' }} />
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
