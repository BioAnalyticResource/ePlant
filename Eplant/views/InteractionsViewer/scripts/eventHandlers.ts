import { Core, EventObject } from 'cytoscape'
import { PopperInstance } from 'cytoscape-popper'

// Global
let cy: Core

// --------------
// Event Listeners
// --------------
/**
 * Add event listener for nodes
 * @param {Core} cyto cytoscape instance
 * @returns {None}
 **/
export const addNodeListener = (cyto: Core) => {
  cy = cyto
  cy.on('mouseover', 'node', (event: EventObject) => {
    const nodeId = event.target.data('id')
    // Check that the node is not a compound node
    if (nodeId !== 'COMPOUND_DNA' && nodeId !== 'COMPOUND_PROTEIN') {
      if (nodeId.substring(0, 3) === 'chr') {
        handleChrNodeHover(event)
      } else {
        handleNodeHover(event)
      }
    }
  })
}

/**
 * Add event listener for edges connecting nodes\
 * @param {Core} cy
 * @returns {None}
 **/
export const addEdgeListener = (cy: Core) => {
  // Listen for pointer events on edges
  cy.on('mouseover', 'edge', (event: EventObject) => {
    // No tooltip on chr edges
    if (event.target._private.classes.values().next().value == 'chr-edge') {
      return false
    }
    handleEdgeHover(event)
  })
}

// --------------
// Event Handlers
// --------------
/**
 * Handle hover over edge node and create appropriate tooltip
 * @param {EventObject} event the current event object
 * @returns {void}
 **/
const handleNodeHover = (event: EventObject) => {
  const node = event.target
  const id = node._private.data.content
  fetch(
    'https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=' +
      id
  )
    .then((response) => response.json())
    .then((gene) => {
      const tip: PopperInstance = node.popper({
        content: () => {
          const content = document.createElement('div')

          content.innerHTML = `
            <style>
              .tooltip {
                padding: 8px;
                background: white;
                minHeight: 100px;
                maxHeight: 200px
                width: 200px;
                font-size: 10px;
                color: black;
                border: 1px solid black;
              } label {
                color: grey;
              }
            </style>
            <div class="tooltip">
              <table>
                <tr>
                  <td><label>Identifier: </label></td>
                  <td>${gene.id}</td>
                </tr>
                <tr>
                  <td><label>Aliases: </label></td>
                  <td>
                    ${
                      gene.aliases.length > 0 ? gene.aliases.slice(0, 3) : 'N/A'
                    }
                  </td>
                </tr>
                <tr>
                  <td><label>Annotation: </label></td>
                  <td>
                    ${gene.annotation != '' ? gene.annotation : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td><button id='${
                    gene.id
                  }' class='loadGene_interactionsView' aliases='${gene.aliases.join(
                    ','
                  )}' annotation='${
                    gene.annotation
                  }' title='Load gene into collection'>Load Gene</button>
                </tr>
              </table>
            </div>`
          const props = {
            content: content,
            duration: 200,
            arrow: false,
            followCursor: false,
            interactive: true,
          }
          return props
        },
      })

      tip.show()
      addMouseOutListener(cy, tip)
    })
}

/**
 * Handle hover over edge connecting nodes and create appropriate tooltip
 * @param {EventObject} event the current event object
 * @returns {void}
 **/
const handleEdgeHover = (event: EventObject) => {
  const edge = event.target
  const data = edge._private.data
  const references =
    data.reference != 'None'
      ? generateLinks(data.reference).map(
          (link, i) => `<a href=${link}>${link}</a>\n`
        )
      : 'N/A'

  const tip = edge.popper({
    content: () => {
      const content = document.createElement('div')

      content.innerHTML = `
        <style>
          .tooltip {
            padding: 8px;
            background: white;
            minHeight: 150px;
            maxHeight: 250px;
            minwidth: 200px;
            maxWidth: 300px;
            font-size: 10px;
            color: black;
            border: 1px solid black;
          }
        </style>
        <div class="tooltip">
          <p>${data.tooltip}</p>
          <p>Reference: \n${references}</p>
        </div>`
      const props = {
        content: content,
        duration: 1000,
        arrow: true,
        followCursor: true,
        interactive: false,
      }
      return props
    },
  })
  tip.show()
  addMouseOutListener(cy, tip)
}

/**
 * Handle hover over chromosome node and create appropriate tooltip
 * @param {EventObject} event the current event object
 * @returns {void}
 **/
const handleChrNodeHover = (event: EventObject) => {
  const node = event.target
  const chrNum = node._private.data.id.substring(3, 4)
  const genes = node._private.data.genes
  const tip: PopperInstance = node.popper({
    content: () => {
      const content = document.createElement('div')

      content.innerHTML = `
        <style>
          .tooltip {
              padding: 8px;
              background: white;
              minHeight: 100px;
              maxHeight: 150px;
              width: 300px;
              color: black;
              border: 1px solid black;
              font-size: 10px;
          } label {
            color: grey;
          }
        </style>
        <div class="tooltip">
          <table>
          <tr>
            <td><label>Chr ${chrNum}: </label></td>
            <td>${genes.length} Protein-DNA Interactions.</td>
          </tr>
          <tr>
            <td><label>Identifiers: </label></td>
            <td>${genes.join(', ')}</td>
          </tr>
          </table>
        </div>
      `
      const props = {
        content: content,
        duration: 200,
        arrow: false,
        followCursor: false,
        interactive: true,
      }
      return props
    },
  })
  tip.show()
  addMouseOutListener(cy, tip)
}

/**
 * Destroys tooltip on mouse out
 * @param {Core} cyto cytoscape instance
 * @param {PopperInstance} tip the tooltip to destroy
 * @returns {void}
 **/
const addMouseOutListener = (cyto: Core, tip: PopperInstance) => {
  // add handler to node for mouse leave
  cy.on('mouseout', 'node', (event) => {
    const nodeID = event.target.data('id')
    if (nodeID !== 'COMPOUND_DNA' && nodeID !== 'COMPOUND_PROTEIN') {
      tip.destroy()
    }
  })
  // destroy tooltip on edge mouse out
  cy.on('mouseout', 'edge', (event) => {
    tip.destroy()
  })
}

// ---------------
// Helper Functions
// ----------------
/**
 * Generate sanitized links from reference string
 * @param {string} reference unsanitized reference string
 * @returns {string[]} array of links
 **/
const generateLinks = (reference: string): string[] => {
  const AL1_HYPERLINK = 'http://interactome.dfci.harvard.edu/A_thaliana/'

  // Sanitize the reference
  const sanitizedReference = reference.split('\n')
  const hyperlinks = []

  for (let i = 0; i < sanitizedReference.length; i = i + 1) {
    // Processes links by reference type
    if (sanitizedReference[i].search('PubMed') !== -1) {
      // Append PubMed link to array
      const subReference = sanitizedReference[i].replace('PubMed', '')
      hyperlinks.push('http://www.ncbi.nlm.nih.gov/pubmed/' + subReference)
    } else if (sanitizedReference[i].search('doi:') !== -1) {
      // Append doi link to array
      const subReference = sanitizedReference[i].replace('doi:', '')
      hyperlinks.push('http://dx.doi.org/' + subReference)
    } else if (sanitizedReference[i].search('AI-1') !== -1) {
      // Append static AL1 link to array
      hyperlinks.push(AL1_HYPERLINK)
    }
  }
  return hyperlinks
}
