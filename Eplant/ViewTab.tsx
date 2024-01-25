import { useEffect } from 'react'
import * as FlexLayout from 'flexlayout-react'
import { Actions } from 'flexlayout-react'

import { ViewContainer } from './UI/Layout/ViewContainer'
import FallbackView from './views/FallbackView'
import { useConfig } from './config'
import {
  useActiveId,
  useGeneticElements,
  usePanes,
  ViewIDContext,
} from './state'

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

export default ViewTab
