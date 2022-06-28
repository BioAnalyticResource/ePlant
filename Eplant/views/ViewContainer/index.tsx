import GeneticElement from '@eplant/GeneticElement'
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
import Box from '@mui/material/Box'
import * as React from 'react'
import { useViewData, View } from '../View'
import LoadingPage from './LoadingPage'

export function ViewContainer(props: {
  view: View
  setView: (view: View) => void
  gene: GeneticElement
}) {
  const { activeData, error, loading, loadingAmount } = useViewData(
    props.view,
    props.gene
  )

  const idLabel = React.useId()
  const selectId = React.useId()
  return (
    <Box>
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
                value={props.gene.views.findIndex(
                  (view) => view.name === props.view.name
                )}
                labelId={idLabel}
                label={'View'}
                id={selectId}
                onChange={(e) =>
                  !isNaN(parseInt(e?.target?.value as string)) &&
                  props.setView(
                    props.gene.views[parseInt(e.target.value as string)]
                  )
                }
              >
                {props.gene.views.map((v, i) => (
                  <MenuItem value={i}>{v.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            disabled={loading}
            onClick={() => {
              downloadFile(
                `${props.view.name}-${props.gene.id}.json`,
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
          paddingTop: '2rem',
        }}
      >
        {loading || !activeData ? (
          <LoadingPage
            loadingAmount={loadingAmount}
            gene={props.gene}
            view={props.view}
          />
        ) : (
          <props.view.component
            geneticElement={props.gene}
            activeData={activeData}
          />
        )}
      </Container>
    </Box>
  )
}
