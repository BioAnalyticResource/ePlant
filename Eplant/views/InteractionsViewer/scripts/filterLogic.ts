import { Core } from 'cytoscape'

/**
 * Applies filter  to edges matching selector\
 * @param {Core} cy cytoscape instance
 * @param {boolean} status The related filterStatus index
 * @param {String} selector The selector by which to filter edges
 * @returns {void}
 **/
export const applyFilter = (cy: Core, status: boolean, selector: string) => {
  if (status) {
    const edges = cy.edges(selector)
    // @ts-expect-error hide should exists?
    edges.hide()
  }
}

/**
 * Hide all layers of node matching id]
 * @param {Core} cy cytoscape instance
 * @param {string} id id of the node to hide
 * @returns {void}
 **/
export const cleanCompoundNode = (cy: Core, id: string) => {
  if (cy.nodes('[parent = "' + id + '"]:visible').length === 0) {
    // @ts-expect-error hide should exists?
    cy.nodes('#' + id).hide()
  }
}

/**
 * Clears interaction view of nodes without associated edges
 * @param {Core} cy cytoscape instance
 * @returns {void}
 */
export const cleanNodes = (cy: Core) => {
  // Get all nodes in interaction view
  const nodes = cy.nodes()
  for (let n = 0; n < nodes.length; n = n + 1) {
    const node = nodes[n]
    const type = node.data('id').substring(9)

    // Remove nodes with no connecting interactions
    const isOrphaned = node.connectedEdges(':visible').length === 0

    if (type === 'DNA_NODE' && isOrphaned) {
      // @ts-expect-error hide should exists?
      node.hide()
    } else if (type === 'PROTEIN_NODE' && isOrphaned) {
      // @ts-expect-error hide should exists?
      node.parent.hide()
    }
  }
}
