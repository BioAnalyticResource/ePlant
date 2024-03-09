import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'

import { Box, CircularProgress, CssBaseline, IconButton } from '@mui/material'
import { ThemeProvider, useTheme } from '@mui/material/styles'

import { dark, light } from './css/theme'
import { ViewContainer } from './UI/Layout/ViewContainer'
import Sidebar, { sidebarWidth } from './UI/Sidebar'
import FallbackView from './views/FallbackView'
import { useConfig } from './config'
import {
  useDarkMode,
  useGeneticElements,
  usePageLoad,
} from './state'
import { updateColors } from './updateColors'

export const Eplant = () => {
  const { viewId, geneId } = useParams()
  const [globalProgress, loaded] = usePageLoad()

  const theme = useTheme()

  const [genes] = useGeneticElements()

  const config = useConfig()

  useEffect(() => {
    if (loaded) {
      updateColors(theme)
    }
  }, [theme, loaded])

  return (
    <>
      <Sidebar />
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
              gene={genes.find((gene) => gene.id === geneId) ?? null}
              view={
                config.views.find(
                  (view) => view.id === (viewId ?? config.defaultView)
                ) ?? FallbackView
              }
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
    </>
  )
}

export default Eplant
