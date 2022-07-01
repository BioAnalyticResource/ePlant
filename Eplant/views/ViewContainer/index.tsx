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
  const viewList = gene?.views ?? freeViews

  const idLabel = React.useId()
  const selectId = React.useId()
  return (
    <Box {...props}>
      <AppBar
        position="static"
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
                value={viewList.findIndex((view) => view.name === view.name)}
                labelId={idLabel}
                label={'View'}
                id={selectId}
                onChange={(e) =>
                  !isNaN(parseInt(e?.target?.value as string)) &&
                  setView(viewList[parseInt(e.target.value as string)])
                }
              >
                {viewList.map((v, i) => (
                  <MenuItem key={i} value={i}>
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
