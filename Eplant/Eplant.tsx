import { ThemeProvider, useTheme } from '@mui/material/styles'
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
import { Add, ExpandMore } from '@mui/icons-material'
import { Provider } from 'jotai'
import * as FlexLayout from 'flexlayout-react'
import TabsetPlaceholder from './UI/Layout/TabsetPlaceholder'
import {
  useGeneticElements,
  useViews,
  viewsAtom,
  useGenericViews,
  useSetViews,
  ViewIDContext,
} from './state'
import { ViewContainer } from './views/ViewContainer'
import {
  Actions,
  BorderNode,
  ITabSetRenderValues,
  Layout,
  TabSetNode,
} from 'flexlayout-react'
import GeneticElement from './GeneticElement'
import { NoViewError } from './views/View'
import NotSupportedView from './views/NotSupportedView'

// TODO: Make this drawer support opening/closing on mobile

const sideBarWidth = 300

function ResponsiveDrawer(props: DrawerProps) {
  const [open, setOpen] = React.useState(props.open)

  return (
    <Drawer {...props} open={open} onClose={() => setOpen(false)}>
      {props.children}
    </Drawer>
  )
}

export type EplantProps = {}

/**
 * Rendered in each tab. Contains a view container.
 * @param props The id of this tab
 * @returns The rendered tab
 */
function ViewTab(props: {
  model: FlexLayout.Model
  id: string
  node: FlexLayout.TabNode
}) {
  const [views, setViews] = useViews()
  const genericViews = useGenericViews()
  const genes = useGeneticElements()[0]
  const view = views[props.id]
  const gene = genes.find((g) => g.id == view.activeGene) ?? null
  if (!view) {
    // TODO: Better fallback
    return <div>Uh oh</div>
  }
  // If there is no gene selected choose one

  let v = (gene ? gene.views.concat(genericViews) : genericViews).find(
    (v) => v.id == view.view
  )

  React.useEffect(() => {
    // Only include the gene name in the tab name if a gene is selected and this view belongs to that gene
    const targetName = `${
      gene && gene.views.some((geneView) => geneView.id == view.view)
        ? gene.id + ' - '
        : ''
    }${v ? v.name : 'No view'}`
    if (props.node.getName() != targetName) {
      props.model.doAction(Actions.renameTab(props.node.getId(), targetName))
    }
  })

  if (!v) {
    if (view.activeGene) {
      if (gene) {
        return (
          <div>
            {view.activeGene} does not support {view.view}.
          </div>
        )
      } else v = NotSupportedView
    } else throw new NoViewError(`No ${view.view} found for ${view.activeGene}`)
  }

  return (
    <ViewIDContext.Provider value={props.id}>
      <ViewContainer
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'scroll',
        }}
        view={v}
        gene={gene ?? null}
        setView={(newView) => {
          setViews((views) => ({
            ...views,
            [props.id]: {
              ...views[props.id],
              view: newView.id,
            },
          }))
        }}
      />
    </ViewIDContext.Provider>
  )
}

/**
 * The flexlayout factory is a function that takes a layout node and returns the React component that should be rendered there.
 * @param node The node to render
 * @param model The flexlayout model
 * @returns The React component to render
 */
const factory: (
  node: FlexLayout.TabNode,
  model: FlexLayout.Model
) => JSX.Element | undefined = (node, model) => {
  const id = node.getId() as string
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
        alignItems: 'center',
      }}
    >
      <ViewTab model={model} id={id} node={node} />
    </div>
  )
}

// For some reason this is necessary to make the tabs work, maybe FlexLayout uses a Jotai provider?
const eplantScope = Symbol('Eplant scope')

/**
 * The main Eplant component. This is the root of the application. It contains the left nav and the layout.
 * @returns {JSX.Element} The rendered Eplant component
 */
export default function Eplant() {
  const [activeId, setActiveId] = React.useState<string>('')
  const [views, setViews] = useViews()
  const [darkMode, setDarkMode] = React.useState<boolean>(true)

  //TODO: Break into more components to prevent unnecessary rerendering
  return (
    <Provider scope={eplantScope}>
      <ThemeProvider theme={darkMode ? dark : light}>
        <CssBaseline />
        <ResponsiveDrawer
          variant="persistent"
          open={true}
          PaperProps={{
            sx: (theme) => ({
              border: 'none',
            }),
          }}
        >
          <Container
            disableGutters
            sx={{
              padding: '20px',
              width: `${sideBarWidth}px`,
              boxSizing: 'border-box',
            }}
          >
            <LeftNav
              onSelectGene={(gene: GeneticElement) =>
                setViews((views) => ({
                  ...views,
                  [activeId]: {
                    ...views[activeId],
                    activeGene: gene.id,
                  },
                }))
              }
              selectedGene={views[activeId ?? '']?.activeGene ?? undefined}
            />
          </Container>
        </ResponsiveDrawer>
        <EplantLayout setActiveId={setActiveId} />
      </ThemeProvider>
    </Provider>
  )
}
function EplantLayout({ setActiveId }: { setActiveId: (id: string) => void }) {
  const setViews = useSetViews()
  const layout = React.useRef<Layout>(null)

  const [model, setModel] = React.useState(
    FlexLayout.Model.fromJson({
      global: {
        tabSetTabStripHeight: 48,
        //TODO: Make tab popout work, currently styles are messed up when copied to the popout
        tabEnableFloat: false,
        tabEnableRename: false,
      },
      borders: [],
      layout: {
        type: 'row',
        weight: 100,
        children: [
          {
            type: 'tabset',
            active: true,
            children: [
              {
                type: 'tab',
                id: 'default',
              },
            ],
          },
        ],
      },
    })
  )
  const theme = useTheme()

  React.useEffect(() => {
    updateColors()
  }, [theme, layout.current])

  return (
    <Box
      sx={(theme) => ({
        height: `calc(100% - ${theme.spacing(1)})`,
        left: `${sideBarWidth}px`,
        right: '0px',
        position: 'absolute',
        margin: theme.spacing(1),
        boxSizing: 'border-box',
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
        ref={layout}
        model={model}
        factory={(node) => factory(node, model)}
        onTabSetPlaceHolder={() => (
          <TabsetPlaceholder addTab={() => addTab()} />
        )}
        onModelChange={(newModel) => {
          const newId = newModel
            .getActiveTabset()
            ?.getSelectedNode?.()
            ?.getId?.()
          if (!newId) throw new Error('No active tabset')
          setActiveId(newId)
        }}
        onRenderTabSet={onRenderTabSet}
      ></FlexLayout.Layout>
    </Box>
  )
  function addTab(tabsetId?: string) {
    if (!layout.current) return
    const id = Math.random().toString(16).split('.')[1]
    setViews((views) => {
      const a = {
        ...views,
        [id]: {
          activeGene: null,
          view: 'get-started',
        },
      }
      return a
    })
    ;(tabsetId
      ? layout.current.addTabToTabSet.bind(layout.current, tabsetId)
      : layout.current.addTabToActiveTabSet)({
      name: 'Get Started',
      component: 'view',
      id,
      type: 'tab',
    })
  }

  function updateColors() {
    if (!layout.current) return
    console.log(theme)
    ;(
      Array.from(
        document.getElementsByClassName('flexlayout__layout')
      ) as HTMLDivElement[]
    ).map((el) => {
      el.style.setProperty('--color-text', theme.palette.text.primary)
      el.style.setProperty(
        '--color-background',
        theme.palette.background.default
      )
      el.style.setProperty('--color-base', theme.palette.background.default)
      el.style.setProperty('--color-primary', theme.palette.primary.main)
      el.style.setProperty(
        '--color-primary-light',
        theme.palette.primary.pale ?? theme.palette.primary.main
      )
      el.style.setProperty('--color-1', theme.palette.background.default)
      el.style.setProperty('--color-2', theme.palette.background.paper)
      el.style.setProperty('--color-active', theme.palette.background.active)
      el.style.setProperty('--color-6', theme.palette.background.active)
      el.style.setProperty('--color-divider', theme.palette.divider)
    })
  }

  function onRenderTabSet(
    node: TabSetNode | BorderNode,
    renderValues: ITabSetRenderValues
  ) {
    if (node.getChildren().length == 0) return
    renderValues.stickyButtons.push(
      <IconButton onClick={() => addTab(node.getId())} size="small">
        <Add />
      </IconButton>
    )
  }
}
