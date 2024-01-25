import { CallReceived } from '@mui/icons-material'
import { Box, CircularProgress, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ViewTab from './ViewTab'
import { useConfig } from './config'
import { useActiveId, useModel, usePageLoad, usePanes } from './state'
import { updateColors } from './updateColors'
/**
 * Directly render a pane based on its id
 */
function DirectPane() {
  const [panes, panesDispatch] = usePanes()
  const params = useSearchParams()[0]
  const id = params.get('id') as string
  const theme = useTheme()
  const [activeId] = useActiveId()
  const [model] = useModel()
  const { tabHeight, views } = useConfig()
  const [globalProgress, loaded] = usePageLoad()
  useEffect(() => {
    updateColors(theme)
  }, [theme, loaded])

  useEffect(() => {
    if (loaded && panes[id] && model.getNodeById(id)) window.close()
  }, [panes, loaded, model])

  return loaded ? (
    <div
      className='flexlayout__layout'
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          bgcolor: 'background.main',
          height: `${tabHeight}px`,
        }}
        className={id == activeId ? 'flexlayout__tabset-selected' : ''}
      >
        <div className='flexlayout__tab_button flexlayout__tab_button_top flexlayout__tab_button--selected'>
          <div className='flexlayout__tab-content'>
            {panes[id]?.activeGene ? panes[id]?.activeGene + ' - ' : ''}
            {views.find((v) => v.id == panes[id]?.view)?.name}
          </div>
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <IconButton
          onClick={() => {
            panesDispatch({ type: 'close-popout', id })
          }}
        >
          <CallReceived />
        </IconButton>
      </Box>
      <Box flexGrow={1}>
        <ViewTab id={id} />
      </Box>
    </div>
  ) : (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </div>
  )
}
export default DirectPane
