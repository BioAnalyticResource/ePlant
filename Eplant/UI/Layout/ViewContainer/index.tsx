import { useEffect, useId, useMemo, useState } from 'react'

import { useConfig } from '@eplant/config'
import GeneticElement from '@eplant/GeneticElement'
import { usePrinting } from '@eplant/state'
import Modal from '@eplant/UI/Modal'
import downloadFile from '@eplant/util/downloadFile'
import ErrorBoundary from '@eplant/util/ErrorBoundary'
import { useViewData } from '@eplant/View/viewData'
import {
  AppBar,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import Box, { BoxProps } from '@mui/material/Box'

import { View } from '../../../View'

import LoadingPage from './LoadingPage'
import ViewOptions from './ViewOptions'

/**
 * Wraps a view in a container that provides a toolbar and a download button. It also manages loading the view's data.
 * @param props.view The view to wrap
 * @param props.setView A function that is called when the user requests to change the wrapped view
 * @param props.gene The gene that is currently selected
 * @param props The remaining props are passed directly to the container
 * @returns
 */
export function ViewContainer<T, S, A>({
  view,
  setView,
  gene,
  ...props
}: {
  view: View<T, S, A>
  setView: (view: View) => void
  gene: GeneticElement | null
} & BoxProps) {
  const { activeData, error, loading, loadingAmount, dispatch, state } =
    useViewData(view, gene)
  const idLabel = useId()
  const selectId = useId()
  const [printing, setPrinting] = usePrinting()

  const [viewingCitations, setViewingCitations] = useState(false)

  const { userViews, views, genericViews } = useConfig()

  useEffect(() => {
    if (printing) {
      setTimeout(() => {
        window.print()
        setPrinting(false)
      }, 100)
    }
  }, [printing])

  const topBar = useMemo(
    () => (
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
                value={view.id}
                renderValue={() => {
                  if (view.id == 'get-started') {
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
                        {view.icon && <view.icon />}
                      </Box>
                      {view.name}
                    </span>
                  )
                }}
                labelId={idLabel}
                label={'View'}
                id={selectId}
                onChange={(e) => {
                  const view = views.find((view) => view.id == e?.target?.value)
                  if (view) setView(view)
                }}
                sx={{
                  '& .MuiSelect-select': {
                    paddingRight: '36px !important',
                  },
                }}
                inputProps={{
                  sx: (theme: {
                    shape: any
                    palette: {
                      background: { paperOverlay: any; edgeLight: any }
                    }
                  }) => ({
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
                      display: userViews.some((u) => u.id == view.id)
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
                      onClick={(e) => {
                        if (view) setView(view)
                      }}
                    >
                      {view.name}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <ViewOptions
            gene={gene}
            state={state}
            view={view}
            loading={loading}
            dispatch={dispatch}
          />
          <Button
            variant='text'
            sx={{
              color: 'secondary.contrastText',
            }}
            disabled={loading}
            color='secondary'
            onClick={() => {
              setViewingCitations(true)
            }}
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
              downloadFile(
                `${view.id}${gene ? '-' + gene.id : ''}.json`,
                JSON.stringify(activeData, null, 2)
              )
            }}
          >
            Download data
          </Button>
        </Toolbar>
      </AppBar>
    ),
    [view.id, gene?.id, loading, activeData, state, dispatch]
  )
  return (
    <Box {...props} display='flex' flexDirection='column'>
      <Modal open={viewingCitations} onClose={() => setViewingCitations(false)}>
        <DialogTitle sx={{ minWidth: '512px' }}>
          <Typography variant='h6'>Data sources for {view.name}</Typography>
        </DialogTitle>
        <DialogContent>
          {view.citation ? (
            <view.citation state={state} activeData={activeData} gene={gene} />
          ) : (
            <Box>No information provided for this view</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingCitations(false)}>Close</Button>
        </DialogActions>
      </Modal>

      {topBar}
      <Box
        sx={(theme) => ({
          padding: '1rem',
          flexGrow: 1,
          display: 'flex',
          gap: theme.spacing(4),
          overflow: 'auto',
          borderStyle: 'solid',
          borderWidth: '0px 0px 0px 1px',
          borderColor: theme.palette.background.edgeLight,
          flexDirection: 'column',
          ...(printing
            ? {
                display: 'block !important',
                padding: 0,
                position: 'fixed',
                left: 0,
                top: 0,
                margin: 0,
                zIndex: 1e9,
                background: theme.palette.background.paper,
                width: '100%',
                minHeight: '100%',
              }
            : {}),
        })}
      >
        <ErrorBoundary>
          {/* Only show the gene header if a gene is selected and this view belongs to the gene */}
          {loading || activeData === undefined ? (
            <LoadingPage
              loadingAmount={loadingAmount}
              gene={gene}
              view={view}
              error={error}
            />
          ) : (
            <>
              <view.component
                state={state}
                geneticElement={gene}
                activeData={activeData}
                dispatch={dispatch}
              />
            </>
          )}
        </ErrorBoundary>
      </Box>
    </Box>
  )
}
