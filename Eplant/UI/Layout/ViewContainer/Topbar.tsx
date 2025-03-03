import { useId } from 'react'

import { useConfig } from '@eplant/config'
import { queryClient } from '@eplant/main'
import { useActiveGeneId, useActiveViewId } from '@eplant/state'
import { useURLState } from '@eplant/state/URLStateProvider'
import { ActionsPanel } from '@eplant/util/Actions/ActionsPanel'
import downloadFile from '@eplant/util/downloadFile'
import { ViewMetadata } from '@eplant/View'
import {
  AppBar,
  Box,
  Button,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
} from '@mui/material'

interface TopBarProps {
  activeView: ViewMetadata<any, any>
  setViewingCitations: (value: boolean) => void
  loading: boolean
}
export const TopBar = ({
  activeView,
  setViewingCitations,
  loading,
}: TopBarProps) => {
  const { userViews, views } = useConfig()
  const [activeViewId, setActiveViewId] = useActiveViewId()
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const { setState } = useURLState<any>()
  const idLabel = useId()
  const selectId = useId()
  const handleChangeView = (e: any) => {
    const view = views.find((view) => view.id === e.target.value)
    if (view) {
      setState(null)
      setActiveViewId(view.id)
    }
  }

  return (
    <AppBar
      variant='elevation'
      sx={(theme) => ({
        background: theme.palette.background.active,
      })}
      position='sticky'
      elevation={0}
    >
      <Toolbar
        sx={(theme) => ({
          gap: '8px',
          paddingRight: 16,
          borderStyle: 'solid',
          borderWidth: '1px 0px 1px 1px',
          borderColor: theme.palette.background.edge,
          borderLeftColor: theme.palette.background.edgeLight,
        })}
      >
        <Stack
          direction='row'
          gap={2}
          sx={{
            flexGrow: 1,
            height: '100%',
            alignItems: 'center',
          }}
        >
          {/* View selector dropdown */}
          <FormControl variant='standard'>
            <Select
              value={activeView.id}
              renderValue={() => {
                if (activeView.id === 'get-started') {
                  return <span style={{ paddingLeft: 8 }}>View selector</span>
                }
                return (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ paddingRight: 1.5, marginTop: 0.5 }}>
                      {activeView.icon && <activeView.icon />}
                    </Box>
                    {activeView.name}
                  </span>
                )
              }}
              labelId={idLabel}
              label={'View'}
              id={selectId}
              onChange={handleChangeView}
              sx={{
                '& .MuiSelect-select': {
                  paddingRight: '36px !important',
                },
              }}
              inputProps={{
                sx: (theme: any) => ({
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: theme.palette.background.paperOverlay,
                  paddingTop: 0.75,
                  paddingLeft: 1,
                  paddingBottom: 0.5,
                  borderTopLeftRadius: theme.shape.borderRadius,
                  borderTopRightRadius: theme.shape.borderRadius,
                  borderStyle: 'solid',
                  borderWidth: 1,
                  borderColor: theme.palette.background.edgeLight,
                  ':focus': {
                    backgroundColor: theme.palette.background.paperOverlay,
                    borderRadius: 1,
                  },
                  '& legend': { display: 'none' },
                  '& fieldset': { top: 0 },
                }),
              }}
            >
              <MenuItem disabled value=''>
                Select a view
              </MenuItem>
              {userViews.map((view) => (
                <MenuItem
                  key={view.id}
                  value={view.id}
                  style={{
                    display: userViews.some((u) => u.id === view.id)
                      ? 'flex'
                      : 'none',
                    paddingTop: 8,
                    paddingBottom: 8,
                    marginBottom: 0,
                  }}
                >
                  <Box sx={{ paddingRight: 2, marginTop: 0.5 }}>
                    {view.icon && <view.icon />}
                  </Box>
                  <ListItemText
                    sx={{
                      textAlign: 'left',
                      color: 'secondary.contrastText',
                      textTransform: 'none',
                      fontWeight: 'regular',
                    }}
                    key={view.name}
                    onClick={() => setActiveViewId(view.id)}
                  >
                    {view.name}
                  </ListItemText>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <ActionsPanel actions={activeView.actions} />
        <Button
          variant='text'
          sx={{
            color: 'secondary.contrastText',
          }}
          disabled={loading}
          color='secondary'
          onClick={() => setViewingCitations(true)}
        >
          Data sources
        </Button>
        <Button
          variant='text'
          sx={{
            color: 'secondary.contrastText',
          }}
          disabled={loading}
          color='secondary'
          onClick={() => {
            let data = queryClient.getQueryData([
              `${activeView.id}-${activeGeneId}`,
            ])

            if (!data) {
              // Some views don't cache based on geneId
              data = queryClient.getQueryData([activeView.id])
            }
            downloadFile(
              `${activeView.id}${activeGeneId ? '-' + activeGeneId : ''}.json`,
              JSON.stringify(data, null, 2)
            )
          }}
        >
          Download data
        </Button>
      </Toolbar>
    </AppBar>
  )
}
