// import useStateWithStorage from '@eplant/util/useStateWithStorage'
import Sidebar from './Sidebar'
import EplantLayout from './EplantLayout'
import DirectPane from './DirectPane'
import { Route, Routes } from 'react-router-dom'
import { useConfig } from './config'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import FlexLayout, {Actions} from 'flexlayout-react'
import {useEffect} from 'react'
import {
  useGeneticElements,
  usePanes,
  ViewIDContext,
  useActiveId,
  getPaneName,
  storage,
  useModel,
  pageLoad,
  usePageLoad,
  useDarkMode
} from './state'
import TabsetPlaceholder from './UI/Layout/TabsetPlaceholder'
import { ViewContainer } from './UI/Layout/ViewContainer'
import { LeftNav } from './UI/LeftNav'
import FallbackView from './views/FallbackView'
import { Theme } from '@mui/system'
import ErrorBoundary from './util/ErrorBoundary'
import { dark, light } from './theme'

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

  useEffect(() => {
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

  // If no gene is selected and there are available genes, select one
  useEffect(() => {
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
 * The main Eplant component. This is the root of the application. It contains the left nav and the layout.
 * @returns {JSX.Element} The rendered Eplant component
 */
export function MainEplant() {
  return (
    <>
      <Sidebar />
      <EplantLayout />
    </>
  )
}

function updateColors(theme: Theme) {
  ;(
    Array.from(
      document.getElementsByClassName('flexlayout__layout')
    ) as HTMLDivElement[]
  ).map((el) => {
    el.style.setProperty('--color-text', theme.palette.text.primary)
    el.style.setProperty('--color-background', theme.palette.background.default)
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
