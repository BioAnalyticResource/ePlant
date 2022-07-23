import { userViews, views, genericViews } from '@eplant/config'
import GeneticElement from '@eplant/GeneticElement'
import { usePrinting, useViewID } from '@eplant/state'
import GeneHeader from '@eplant/UI/GeneHeader'
import Modal from '@eplant/UI/Modal'
import downloadFile from '@eplant/util/downloadFile'
import {
  AppBar,
  Button,
  ButtonBase,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import Box, { BoxProps } from '@mui/material/Box'
import * as React from 'react'
import { useViewData, View } from '../../../views/View'
import LoadingPage from './LoadingPage'

/**
 * Wraps a view in a container that provides a toolbar and a download button. It also manages loading the view's data.
 * @param props.view The view to wrap
 * @param props.setView A function that is called when the user requests to change the wrapped view
 * @param props.gene The gene that is currently selected
 * @param props The remaining props are passed directly to the container
 * @returns
 */
export function ViewContainer({
  view,
  setView,
  gene,
  ...props
}: {
  view: View
  setView: (view: View) => void
  gene: GeneticElement | null
} & BoxProps) {
  const { activeData, error, loading, loadingAmount } = useViewData(view, gene)

  const idLabel = React.useId()
  const selectId = React.useId()
  const [printing, setPrinting] = usePrinting()

  const [viewingCitations, setViewingCitations] = React.useState(false)

  const viewId = useViewID()

  React.useEffect(() => {
    if (printing == viewId) {
      setTimeout(() => {
        window.print()
        setPrinting(null)
      }, 100)
    }
  }, [printing])
  return (
    <Box {...props}>
      <Modal open={viewingCitations} onClose={() => setViewingCitations(false)}>
        <DialogTitle>
          <Typography variant="h6">
            Citation and experiment information for "{view.name}"
          </Typography>
        </DialogTitle>
        <DialogContent>
          {view.citation ? (
            <view.citation gene={gene} />
          ) : (
            <Box>No citations provided for this view</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingCitations(false)}>Close</Button>
        </DialogActions>
      </Modal>

      <AppBar
        variant="elevation"
        sx={(theme) => ({
          background: theme.palette.background.active,
        })}
        position="sticky"
        elevation={0}
      >
        <Toolbar style={{ gap: '8px' }}>
          {/* View selector dropdown */}
          <Box sx={{ flexGrow: 1 }}>
            <FormControl variant="standard">
              <InputLabel id={idLabel}>View</InputLabel>
              <Select
                value={view.id}
                labelId={idLabel}
                label={'View'}
                id={selectId}
                onChange={(e) => {
                  const v = views.find((v) => v.id == e?.target?.value)
                  if (v) setView(v)
                }}
              >
                {views.map((v, i) => (
                  <MenuItem
                    key={v.id}
                    value={v.id}
                    style={{
                      display: userViews.some((u) => u.id == v.id)
                        ? 'block'
                        : 'none',
                    }}
                  >
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            disabled={loading}
            color="secondary"
            onClick={() => {
              setViewingCitations(true)
            }}
          >
            Get citations
          </Button>
          <Button
            variant="outlined"
            disabled={loading}
            color="secondary"
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
      <Container
        sx={(theme) => ({
          padding: '2rem',
          overflow: 'scroll',
          ...(printing == viewId
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
                overflow: 'scroll',
              }
            : {}),
        })}
      >
        <Stack gap={4} direction="column">
          {/* Only show the gene header if a gene is selected and this view belongs to the gene */}
          {gene && !genericViews.some((geneView) => view.id == geneView.id) ? (
            <GeneHeader geneticElement={gene} />
          ) : null}
          {loading || !activeData ? (
            <LoadingPage
              loadingAmount={loadingAmount}
              gene={gene}
              view={view}
              error={error}
            />
          ) : (
            <view.component geneticElement={gene} activeData={activeData} />
          )}
        </Stack>
      </Container>
    </Box>
  )
}
