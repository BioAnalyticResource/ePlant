import GeneticElement from '@eplant/GeneticElement'
import { useFreeViews } from '@eplant/state'
import downloadFile from '@eplant/util/downloadFile'
import {
  AppBar,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Toolbar,
} from '@mui/material'
import Box, { BoxProps } from '@mui/material/Box'
import * as React from 'react'
import { useViewData, View } from '../View'
import LoadingPage from './LoadingPage'

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

  const freeViews = useFreeViews()
  const viewList = freeViews.concat(gene?.views ?? [])

  const idLabel = React.useId()
  const selectId = React.useId()
  return (
    <Box {...props}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={(theme) => ({
          backgroundColor: theme.palette.secondary.main,
        })}
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
                  const v = viewList.find((v) => v.id == e?.target?.value)
                  if (v) setView(v)
                }}
              >
                {viewList.map((v, i) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            disabled={loading}
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
        {loading || !activeData ? (
          <LoadingPage loadingAmount={loadingAmount} gene={gene} view={view} />
        ) : (
          <view.component geneticElement={gene} activeData={activeData} />
        )}
      </Container>
    </Box>
  )
}
