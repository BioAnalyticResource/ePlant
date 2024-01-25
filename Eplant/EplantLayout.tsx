import { Add, CallMade, Close } from '@mui/icons-material'
import { Box, CircularProgress, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import * as FlexLayout from 'flexlayout-react'
import {
  Actions,
  BorderNode,
  ITabSetRenderValues,
  Layout,
  TabSetNode,
} from 'flexlayout-react'
import { useEffect, useRef } from 'react'
import TabsetPlaceholder from './UI/Layout/TabsetPlaceholder'
import { sidebarWidth } from './UI/Sidebar'
import ViewTab from './ViewTab'
import { useConfig } from './config'
import {
  getPaneName,
  storage,
  useActiveId,
  useModel,
  usePageLoad,
  usePanes,
} from './state'
import { updateColors } from './updateColors'

const EplantLayout = () => {
  const [panes, panesDispatch] = usePanes()
  const layout = useRef<Layout>(null)
  const [activeId, setActiveId] = useActiveId()
  const { tabHeight } = useConfig()
  const [model, setModel] = useModel()
  const theme = useTheme()
  const [globalProgress, loaded] = usePageLoad()

  useEffect(() => {
    if (loaded) {
      updateColors(theme)
    }
  }, [theme, loaded])

  // Update the model when the activeId changes
  useEffect(() => {
    if (model.getNodeById(activeId)) model.doAction(Actions.selectTab(activeId))
    // TODO: Need to add back if using flex-layout from Alex's fork
    // else model.doAction(Actions.deselectTabset())
  }, [activeId, model])

  // Add a new tab when there is a non-popout pane
  useEffect(() => {
    if (loaded) {
      for (const id in panes) {
        if (panes[id].popout) continue
        if (!model.getNodeById(id)) addTab({ tabId: id })
      }
    }
  }, [panes, model, loaded])

  useEffect(() => {
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
        left: `${sidebarWidth}px`,
        right: '0px',
        position: 'absolute',
        margin: theme.spacing(1),
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
                  key='close'
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
                  size='small'
                >
                  <Close />
                </IconButton>,
              ]
            }}
          ></FlexLayout.Layout>
        ) : (
          <div>
            <CircularProgress
              variant='indeterminate'
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
        size='small'
        key='add-tab'
      >
        <Add />
      </IconButton>,
    )
    renderValues.buttons.push(
      <IconButton
        onClick={() => {
          const id = node.getSelectedNode()?.getId()
          if (id) makePopout(id)
        }}
        size='small'
        key='make-popout'
      >
        <CallMade />
      </IconButton>,
    )
  }
}
export default EplantLayout

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
