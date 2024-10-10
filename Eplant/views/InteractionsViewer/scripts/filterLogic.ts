import { Core } from 'cytoscape'



/*
* Applies filter to get edges matching selector
* @param {HTMLElement} checkbox The related checkbox element
* @param {Number} index The related filterStatus index
* @param {String} selector The selector by which to filter edges
* @return {boolean} The state of the related checkbox element
*/
export const applyFilter = (cy: Core, selector: string) => {
    const edges = cy.edges(selector);
    edges.hide();
}



/**
 * Clears interaction view of nodes without associated edges
 * @returns {void}
 */
export const cleanNodes = (cy: Core) => {
    // Get all nodes in interaction view
    const nodes = cy.nodes();
    for (let n = 0; n < nodes.length; n = n + 1) {
        const node = nodes[n];
        const type = node.data('id').substring(9);

        // Remove nodes with no connecting interactions
        const isOrphaned = node.connectedEdges(':visible').length === 0;

        if (type === 'DNA_NODE' && isOrphaned) {
            node.hide();
        } else if (type === 'PROTEIN_NODE' && isOrphaned) {
            node._private.parent.hide();
        }
    }
};