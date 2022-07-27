import useStateWithStorage from '@eplant/util/useStateWithStorage'
import { Add, CallMade, Flight } from '@mui/icons-material'
import { Box, Container, Drawer, DrawerProps, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import * as FlexLayout from 'flexlayout-react'
import {
  Actions,
  BorderNode,
  ITabSetRenderValues,
  Layout,
  TabSetNode,
} from 'flexlayout-react'
import * as React from 'react'
import { Route, Routes, useParams, useRoutes } from 'react-router-dom'
import { userViews, views } from './config'
import GeneticElement from './GeneticElement'
import Species from './Species'
import {
  useGeneticElements,
  usePanes,
  useSetPersist,
  useSetDarkMode,
  ViewIDContext,
  usePanesDispatch,
  useActiveId,
} from './state'
import TabsetPlaceholder from './UI/Layout/TabsetPlaceholder'
import { ViewContainer } from './UI/Layout/ViewContainer'
import { LeftNav } from './UI/LeftNav'
import PopoutPlaceholder from './UI/Layout/PopoutPlaceholder'
import FallbackView from './views/FallbackView'

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
  layout?: {
    node: FlexLayout.TabNode
    model: FlexLayout.Model
  }
  id: string
}) {
  const [activeId, setActiveId] = useActiveId()
  const [panes, panesDispatch] = usePanes()
  const genes = useGeneticElements()[0]
  const view = panes[props.id]
  const gene = genes.find((g) => g.id == view?.activeGene) ?? null
  // If there is no gene selected choose one
  const v = views.find((v) => v.id == view?.view) ?? FallbackView

  const [popout, setPopout] = React.useState<Window | undefined>()

  React.useEffect(() => {
    // Only include the gene name in the tab name if a gene is selected and this view belongs to that gene
    const targetName = `${
      gene && userViews.some((geneView) => geneView.id == view?.view)
        ? gene.id + ' - '
        : ''
    }${v ? v.name : 'No view'}`
    if (props.layout && props.layout.node.getName() != targetName) {
      props.layout.model.doAction(
        Actions.renameTab(props.layout.node.getId(), targetName)
      )
    }
  })

  React.useEffect(() => {
    if (view?.popout && props.layout && !popout) {
      const pane = window.open('/pane/', props.id, 'popup,width=800,height=600')
      if (pane) {
        setPopout(pane)
        ;(pane as any).id = props.id
        pane.onload = () => {
          pane.onbeforeunload = () => {
            panesDispatch({ type: 'close-popout', id: props.id })
            setPopout(undefined)
          }
        }
      }
    }
    if (!view || (view && !view.popout && !props.layout)) {
      window.close()
    }
  }, [view?.popout, props.layout, popout])

  if (view?.popout && props.layout) {
    return (
      <PopoutPlaceholder
        focus={() => popout && popout.focus()}
        dock={() =>
          panesDispatch({
            type: 'close-popout',
            id: props.id,
          })
        }
      />
    )
  }
  if (!view) {
    // TODO: Better fallback
    return <div>Uh oh</div>
  }
  return (
    <ViewIDContext.Provider value={props.id}>
      <ViewContainer
        onClick={() => setActiveId(props.id)}
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'scroll',
          bgcolor: 'background.paper',
        }}
        view={v}
        gene={gene ?? null}
        setView={(newView) => {
          panesDispatch({
            type: 'set-view',
            id: props.id,
            view: newView.id,
          })
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
      <ViewTab layout={{ model, node }} id={id} />
    </div>
  )
}

export default function Eplant() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<MainEplant />} />
        <Route path="/pane" element={<DirectPane />} />
      </Route>
    </Routes>
  )
}

/**
 * Directly render a pane based on its id
 */
function DirectPane() {
  return <ViewTab id={(window as any).id as string} />
}

/**
 * The main Eplant component. This is the root of the application. It contains the left nav and the layout.
 * @returns {JSX.Element} The rendered Eplant component
 */
export function MainEplant() {
  const [activeId, setActiveId] = useActiveId()
  const [panes, panesDispatch] = usePanes()
  //TODO: Break into more components to prevent unnecessary rerendering
  return (
    <>
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
            height: '100%',
            padding: '20px',
            width: `${sideBarWidth}px`,
            boxSizing: 'border-box',
          }}
        >
          <LeftNav
            onSelectGene={(gene: GeneticElement) =>
              panesDispatch({
                type: 'set-active-gene',
                id: activeId,
                activeGene: gene.id,
              })
            }
            selectedGene={panes[activeId ?? '']?.activeGene ?? undefined}
          />
        </Container>
      </ResponsiveDrawer>
      <EplantLayout />
    </>
  )
}
function EplantLayout(props: {}) {
  const [panes, panesDispatch] = usePanes()
  const layout = React.useRef<Layout>(null)

  const [activeId, setActiveId] = useActiveId()
  const [model, setModel] = useStateWithStorage(
    'flexlayout-model',
    FlexLayout.Model.fromJson({
      global: {
        tabSetTabStripHeight: 48,
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
    }),
    (m) => JSON.stringify(m.toJson()),
    (s) => FlexLayout.Model.fromJson(JSON.parse(s))
  )
  const theme = useTheme()

  React.useEffect(() => {
    updateColors()
  }, [theme, layout.current])

  // Update the model when the activeId changes
  React.useEffect(() => {
    model.doAction(Actions.selectTab(activeId))
  }, [activeId, model])

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
          // Update the selected tab
          const newId = newModel
            .getActiveTabset()
            ?.getSelectedNode?.()
            ?.getId?.()
          setActiveId(newId ?? '__none__')
          localStorage.setItem(
            'flexlayout-model',
            JSON.stringify(newModel.toJson())
          )
          // Close any tabs that aren't in the new model
          for (const id in panes) {
            if (!newModel.getNodeById(id)) {
              panesDispatch({
                type: 'close',
                id,
              })
            }
          }
        }}
        onRenderTabSet={onRenderTabSet}
      ></FlexLayout.Layout>
    </Box>
  )
  function addTab(tabsetId?: string) {
    if (!layout.current) return
    const id = Math.random().toString(16).split('.')[1] as string
    const activeTab = model.getActiveTabset()?.getSelectedNode?.()?.getId?.()
    const activeGene = activeTab ? panes[activeTab]?.activeGene ?? null : null
    panesDispatch({
      type: 'new',
      id,
      activeGene,
    })

    layout.current.addTabToTabSet(
      tabsetId ?? model.getActiveTabset()?.getId?.() ?? '',
      {
        name: 'Get Started',
        component: 'view',
        id,
        type: 'tab',
      }
    )
  }

  function updateColors() {
    if (!layout.current) return
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

  function makePopout(id: string) {
    panesDispatch({
      type: 'make-popout',
      id,
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
    renderValues.buttons.push(
      <IconButton
        onClick={() => {
          const id = node.getSelectedNode()?.getId()
          if (id) makePopout(id)
        }}
        size="small"
      >
        <CallMade />
      </IconButton>
    )
  }
}
