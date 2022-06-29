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
import arabidopsis from './Species/arabidopsis'
import { dark, light } from './theme'
import { LeftNav } from './UI/LeftNav'
import { ExpandMore } from '@mui/icons-material'
import { Provider } from 'jotai'
import * as FlexLayout from 'flexlayout-react'

// TODO: Make this drawer support opening/closing on mobile

const sideBarWidth = 240

function ResponsiveDrawer(props: DrawerProps) {
  const [open, setOpen] = React.useState(props.open)

  return (
    <Drawer {...props} open={open} onClose={() => setOpen(false)}>
      {props.children}
    </Drawer>
  )
}

export type EplantProps = {}

const factory: (node: FlexLayout.TabNode) => JSX.Element | undefined = (
  node
) => {
  const component = node.getComponent()
  const name = node.getName()
  if (component == 'text')
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          border: '1px solid #555',
          display: 'flex',
          justifyContent: 'center',
          boxSizing: 'border-box',
          alignItems: 'center',
        }}
      >
        {name}
      </div>
    )
}

export default function Eplant() {
  const [model, setModel] = React.useState(
    FlexLayout.Model.fromJson({
      global: {},
      borders: [],
      layout: {
        type: 'row',
        weight: 100,
        children: [
          {
            weight: 50,
            type: 'tabset',
            selected: 0,
            children: [
              {
                type: 'tab',
                component: 'text',
                name: 'test2',
              },
              {
                type: 'tab',
                component: 'text',
                name: 'test3',
              },
            ],
          },
        ],
      },
    })
  )
  return (
    <Provider>
      <ThemeProvider theme={dark}>
        <CssBaseline />
        <Box>
          <ResponsiveDrawer
            sx={{
              boxSizing: 'border-box',
              width: sideBarWidth,
            }}
            variant="persistent"
            open={true}
          >
            <Container disableGutters sx={{ padding: '20px' }}>
              <LeftNav />
            </Container>
          </ResponsiveDrawer>
          <Box
            sx={(theme) => ({
              height: '100%',
              left: `${sideBarWidth}px`,
              right: '0px',
              position: 'absolute',
            })}
          >
            <Box
              sx={{
                background: '#fff',
                width: '100%',
                height: '100%',
              }}
            ></Box>
            <FlexLayout.Layout
              model={model}
              factory={factory}
              onTabSetPlaceHolder={() => <div>This is a placehodler</div>}
            ></FlexLayout.Layout>
          </Box>
        </Box>
      </ThemeProvider>
    </Provider>
  )
}
