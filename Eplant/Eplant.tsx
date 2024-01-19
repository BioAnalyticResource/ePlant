import useStateWithStorage from '@eplant/util/useStateWithStorage'
import { Add, OpenInNew, CallReceived, Close } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  Drawer,
  DrawerProps,
  IconButton,
  LinearProgress,
  Tooltip,
  ThemeProvider,
} from '@mui/material'
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
import { Route, Routes, useSearchParams } from 'react-router-dom'
import { useConfig } from './config'
import GeneticElement from './GeneticElement'
import {
  useGeneticElements,
  usePanes,
  ViewIDContext,
  useActiveId,
  getPaneName,
  storage,
  useModel,
  usePageLoad,
  useDarkMode,
} from './state'
import TabsetPlaceholder from './UI/Layout/TabsetPlaceholder'
import { ViewContainer } from './UI/Layout/ViewContainer'
import { LeftNav } from './UI/LeftNav'
import FallbackView from './views/FallbackView'
import { Theme } from '@mui/system'
import ErrorBoundary from './util/ErrorBoundary'
import { dark, light } from './theme'

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

export type EplantProps = Record<string, never>

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
  const { userViews, views } = useConfig()
  const v = views.find((v) => v.id == view?.view) ?? FallbackView

  React.useEffect(() => {
    // Only include the gene name in the tab name if a gene is selected and this view belongs to that gene
    const targetName = `${
      gene && userViews.some((geneView) => geneView.id == view?.view)
        ? gene.id + ' - '
        : ''
    }${v ? v.name : 'No view'}`
    if (props.layout && props.layout.node.getName() != targetName) {
      props.layout.model.doAction(
        Actions.renameTab(props.layout.node.getId(), targetName),
      )
    }
  })

  // If no gene is selected and there are available genes, select one
  React.useEffect(() => {
    if (props.id == activeId && !gene && genes.length > 0) {
      panesDispatch({
        type: 'set-active-gene',
        id: props.id,
        activeGene: genes[0].id,
      })
    }
  }, [gene, genes, activeId])

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
  model: FlexLayout.Model,
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
  const { rootPath } = useConfig()
  const [darkMode, setDarkMode] = useDarkMode()

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <CssBaseline />
      <Routes>
        <Route path={rootPath}>
          <Route index element={<MainEplant />} />
          <Route path="pane" element={<DirectPane />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

/**
 * Directly render a pane based on its id
 */
function DirectPane() {
  const [panes, panesDispatch] = usePanes()
  const params = useSearchParams()[0]
  const id = params.get('id') as string
  const theme = useTheme()
  const [activeId] = useActiveId()
  const [model] = useModel()
  const { tabHeight, views } = useConfig()
  const [globalProgress, loaded] = usePageLoad()
  React.useEffect(() => {
    updateColors(theme)
  }, [theme, loaded])

  React.useEffect(() => {
    if (loaded && panes[id] && model.getNodeById(id)) window.close()
  }, [panes, loaded, model])

  return loaded ? (
    <div
      className="flexlayout__layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          bgcolor: 'background.main',
          height: `${tabHeight}px`,
        }}
        className={id == activeId ? 'flexlayout__tabset-selected' : ''}
      >
        <div className="flexlayout__tab_button flexlayout__tab_button_top flexlayout__tab_button--selected">
          <div className="flexlayout__tab-content">
            {panes[id]?.activeGene ? panes[id]?.activeGene + ' - ' : ''}
            {views.find((v) => v.id == panes[id]?.view)?.name}
          </div>
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <IconButton
          onClick={() => {
            panesDispatch({ type: 'close-popout', id })
          }}
        >
          <CallReceived />
        </IconButton>
      </Box>
      <Box flexGrow={1}>
        <ViewTab id={id} />
      </Box>
    </div>
  ) : (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </div>
  )
}

/**
 * The main Eplant component. This is the root of the application. It contains the left nav and the layout.
 * @returns {JSX.Element} The rendered Eplant component
 */
export function MainEplant() {
  const [activeId] = useActiveId()
  const [panes, panesDispatch] = usePanes()
  //TODO: Break into more components to prevent unnecessary rerendering
  return (
    <>
      <ResponsiveDrawer
        variant="persistent"
        open={true}
        PaperProps={{
          sx: {
            border: 'none',
            backgroundColor: 'transparent',
          },
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
function EplantLayout() {
  const [panes, panesDispatch] = usePanes()
  const layout = React.useRef<Layout>(null)

  const [activeId, setActiveId] = useActiveId()
  const { tabHeight } = useConfig()
  const [model, setModel] = useModel()
  const theme = useTheme()
  const [globalProgress, loaded] = usePageLoad()

  React.useEffect(() => {
    if (loaded) {
      updateColors(theme)
    }
  }, [theme, loaded])

  // Update the model when the activeId changes
  React.useEffect(() => {
    if (model.getNodeById(activeId)) model.doAction(Actions.selectTab(activeId))
    // TODO: Need to add back if using flex-layout from Alex's fork
    // else model.doAction(Actions.deselectTabset())
  }, [activeId, model])

  // Add a new tab when there is a non-popout pane
  React.useEffect(() => {
    if (loaded) {
      for (const id in panes) {
        if (panes[id].popout) continue
        if (!model.getNodeById(id)) addTab({ tabId: id })
      }
    }
  }, [panes, model, loaded])

  React.useEffect(() => {
    if (!loaded) return
    const json = model.toJson()
    if (!json.global) json.global = {}
    json.global.tabSetTabStripHeight = tabHeight
    setModel(FlexLayout.Model.fromJson(json))
  }, [tabHeight, loaded])

  return (
    <Box
      sx={(theme) => ({
        height: `calc(100% - ${theme.spacing(1)})`,
        left: `${sideBarWidth}px`,
        right: '0px',
        position: 'absolute',
        margin: theme.spacing(1),
        marginRight: 0,
        boxSizing: 'border-box',
      })}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loaded ? (
          <FlexLayout.Layout
            ref={layout}
            model={model}
            factory={(node) => factory(node, model)}
            onTabSetPlaceHolder={() => (
              <TabsetPlaceholder addTab={() => addTab({})} />
            )}
            onModelChange={(newModel) => {
              // Update the selected tab
              const newId = newModel
                .getActiveTabset()
                ?.getSelectedNode?.()
                ?.getId?.()
              if (newId) setActiveId(newId)
              storage.set('flexlayout-model', JSON.stringify(model.toJson()))
            }}
            onRenderTabSet={onRenderTabSet}
            onRenderTab={(node, renderValues) => {
              renderValues.buttons = [
                <IconButton
                  key="close"
                  // Why is this necessary?
                  // Idk, but flexlayout-react uses it for their close buttons
                  // And they don't work without it
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseUp={(e) => {
                    panesDispatch({ type: 'close', id: node.getId() })
                    model.doAction(Actions.deleteTab(node.getId()))
                  }}
                  size="small"
                >
                  <Close fontSize="inherit" />
                </IconButton>,
              ]
            }}
          ></FlexLayout.Layout>
        ) : (
          <div>
            <CircularProgress
              variant="indeterminate"
              value={globalProgress * 100}
            />
          </div>
        )}
      </Box>
    </Box>
  )
  function addTab({ tabsetId, tabId }: { tabsetId?: string; tabId?: string }) {
    if (!layout.current) return

    const id = tabId ?? (Math.random().toString(16).split('.')[1] as string)
    const activeTab = model.getActiveTabset()?.getSelectedNode?.()?.getId?.()
    const activeGene = activeTab ? panes[activeTab]?.activeGene ?? null : null
    // Make a pane if a new id needs to be generated
    // If the id is provided then assume that there already is a pane
    if (!tabId) {
      panesDispatch({
        type: 'new',
        id,
        activeGene,
      })
    }

    const name = panes[id] ? getPaneName(panes[id]) : 'Get started'

    layout.current.addTabToTabSet(
      tabsetId ??
        model.getActiveTabset()?.getId?.() ??
        model.getRoot().getChildren()[0]?.getId() ??
        '',
      {
        name: name,
        component: 'view',
        id,
        type: 'tab',
      },
    )
  }

  function makePopout(id: string) {
    panesDispatch({
      type: 'make-popout',
      id,
    })
    const url =
      (window.location.pathname + '/pane').replace('//', '/') + '?id=' + id
    const pane = window.open(url, id, 'popup,width=800,height=600')
    if (pane) {
      model.doAction(Actions.deleteTab(id))
    }
  }

  function onRenderTabSet(
    node: TabSetNode | BorderNode,
    renderValues: ITabSetRenderValues,
  ) {
    if (node.getChildren().length == 0) return
    renderValues.stickyButtons.push(
      <IconButton
        onClick={() => addTab({ tabsetId: node.getId() })}
        size="small"
        key="add-tab"
      >
        <Add fontSize="inherit" />
      </IconButton>
    )
    renderValues.buttons.push(
      <Tooltip title="Open in new window">
        <IconButton
          onClick={() => {
            const id = node.getSelectedNode()?.getId()
            if (id) makePopout(id)
          }}
          size="small"
          key="make-popout"
        >
          <OpenInNew fontSize="inherit" />
        </IconButton>
      </Tooltip>
    )
  }
}

function updateColors(theme: Theme) {
  ;(
    Array.from(
      document.getElementsByClassName('flexlayout__layout'),
    ) as HTMLDivElement[]
  ).map((el) => {
    el.style.setProperty('--color-text', theme.palette.text.primary)
    el.style.setProperty('--color-background', theme.palette.background.default)
    el.style.setProperty('--color-base', theme.palette.background.default)
    el.style.setProperty('--color-primary', theme.palette.primary.main)
    el.style.setProperty(
      '--color-primary-light',
      theme.palette.primary.pale ?? theme.palette.primary.main,
    )
    el.style.setProperty('--color-1', theme.palette.background.default)
    el.style.setProperty('--color-2', theme.palette.background.paper)
    el.style.setProperty('--color-active', theme.palette.background.active)
    el.style.setProperty('--color-6', theme.palette.background.active)
    el.style.setProperty('--color-divider', theme.palette.divider)
  })
}
