import GeneticElement from '@eplant/GeneticElement'
import { useGenericViews, useUserViews, useViews } from '@eplant/state'
import GeneHeader from '@eplant/UI/GeneHeader'
import downloadFile from '@eplant/util/downloadFile'
import {
  AppBar,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
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

  const userViews = useUserViews()
  const views = useViews()
  const genericViews = useGenericViews()

  const idLabel = React.useId()
  const selectId = React.useId()
  return (
    <Box {...props}>
      <AppBar
        variant="elevation"
        sx={(theme) => ({
          background: theme.palette.background.active,
        })}
        position="sticky"
        elevation={0}
      >
        <Toolbar>
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
        sx={{
          padding: '2rem',
          overflow: 'scroll',
        }}
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
            />
          ) : (
            <view.component geneticElement={gene} activeData={activeData} />
          )}
        </Stack>
      </Container>
    </Box>
  )
}
