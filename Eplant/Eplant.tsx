import { ThemeProvider } from '@mui/material/styles'
import {
  Box,
  Container,
  CssBaseline,
  Drawer,
  DrawerProps,
  Icon,
  IconButton,
} from '@mui/material'
import * as React from 'react'
import EplantStateProvider from './contexts/EplantState'
import {
  GenesContext,
  useGeneticElementsState,
} from './contexts/geneticElements'
import arabidopsis from './Species/arabidopsis'
import { dark, light } from './theme'
import { LeftNav } from './UI/LeftNav'
import { ExpandMore } from '@mui/icons-material'

// TODO: Make this drawer support opening/closing on mobile
function ResponsiveDrawer(props: DrawerProps) {
  const [open, setOpen] = React.useState(props.open)

  return (
    <Drawer {...props} open={open} onClose={() => setOpen(false)}>
      {props.children}
    </Drawer>
  )
}

export type EplantProps = {}

export default function Eplant() {
  return (
    <EplantStateProvider species={[arabidopsis]}>
      <ThemeProvider theme={dark}>
        <CssBaseline />
        <ResponsiveDrawer variant="persistent" open={true}>
          <Container disableGutters sx={{ padding: '20px', width: '350px' }}>
            <LeftNav />
          </Container>
        </ResponsiveDrawer>
      </ThemeProvider>
    </EplantStateProvider>
  )
}
