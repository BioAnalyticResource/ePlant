import { ThemeProvider } from '@mui/material/styles'
import { Box, Container, CssBaseline, Drawer } from '@mui/material'
import * as React from 'react'
import EplantStateProvider from './contexts/EplantState'
import {
  GenesContext,
  useGeneticElementsState,
} from './contexts/geneticElements'
import arabidopsis from './Species/arabidopsis'
import { dark, light } from './theme'
import { LeftNav } from './UI/LeftNav'

export type EplantProps = {}

export default function Eplant() {
  return (
    <EplantStateProvider species={[arabidopsis]}>
      <ThemeProvider theme={dark}>
        <CssBaseline />
        <Drawer variant="persistent" open={true}>
          <Container sx={{ paddingTop: '20px', width: '350px' }}>
            <LeftNav />
          </Container>
        </Drawer>
      </ThemeProvider>
    </EplantStateProvider>
  )
}
