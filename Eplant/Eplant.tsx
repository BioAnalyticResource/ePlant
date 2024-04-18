import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { Box, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { ViewContainer } from './UI/Layout/ViewContainer'
import Sidebar, { collapsedSidebarWidth, sidebarWidth } from './UI/Sidebar'
import GetStartedView from './views/GetStartedView'
import { useConfig } from './config'
import { useGeneticElements, usePageLoad,   useSidebarState, } from './state'
import { updateColors } from './updateColors'

export const Eplant = () => {
  const { viewId, geneId } = useParams()
  const [globalProgress, loaded] = usePageLoad()
  const [isCollapse, setIsCollapse] = useSidebarState()
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
          transition: 'all 1s ease-out',
          height: `calc(100% - ${theme.spacing(1)})`,
          left: `${isCollapse ? collapsedSidebarWidth : sidebarWidth}px`,
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
                config.views.find((view) => view.id === viewId) ?? GetStartedView
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
