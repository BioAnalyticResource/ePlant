import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useConfig } from '@eplant/config'
import {
  useActiveGeneId,
  useActiveViewId,
  useGeneticElements,
  usePrinting,
} from '@eplant/state'
import Modal from '@eplant/UI/Modal'
import ErrorBoundary from '@eplant/util/ErrorBoundary'
import { ViewDataError } from '@eplant/View'
import GeneInfoViewMetadata from '@eplant/views/GeneInfoView'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import LoadingPage from './LoadingPage'
import { TopBar } from './Topbar'

/**
 * Wraps a view in a container that provides a toolbar and a download button. It also manages loading the view's data.
 * @param props.view The view to wrap
 * @param props.setView A function that is called when the user requests to change the wrapped view
 * @param props.gene The gene that is currently selected
 * @param props The remaining props are passed directly to the container
 * @returns
 */
export function ViewContainer<T, S, A>({ ...props }) {
  const [printing, setPrinting] = usePrinting()
  const [viewingCitations, setViewingCitations] = useState(false)
  const { views } = useConfig()
  const [genes] = useGeneticElements()
  const [activeGeneId] = useActiveGeneId()
  const [activeViewId] = useActiveViewId()

  // Get view and gene objects once everything resolves
  const activeView =
    views.find((view) => view.id === activeViewId) ?? GeneInfoViewMetadata
  const gene = genes.find((gene) => gene.id === activeGeneId) ?? null
  return (
    <Box {...props} display='flex' flexDirection='column'>
      <Modal open={viewingCitations} onClose={() => setViewingCitations(false)}>
        <DialogTitle sx={{ minWidth: '512px' }}>
          <Typography variant='h6'>
            Data sources for {activeView.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {activeView.citation ? (
            <activeView.citation />
          ) : (
            <Box>No information provided for this view</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingCitations(false)}>Close</Button>
        </DialogActions>
      </Modal>

      <TopBar
        activeView={activeView}
        loading={false}
        setViewingCitations={setViewingCitations}
      />
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
          <Outlet
            context={{
              geneticElement: gene,
            }}
          ></Outlet>
        </ErrorBoundary>
      </Box>
    </Box>
  )
}
