import { Core } from 'cytoscape'
import { PopperInstance } from 'cytoscape-popper'
import { followCursor } from 'tippy.js'

// import GeneticElement from '@eplant/GeneticElement'
// import arabidopsis from '@eplant/Species/arabidopsis'
// import { useActiveGeneId, useGeneticElements, useSetActiveGeneId, useSetGeneticElements } from '@eplant/state'
// import { GeneItem } from '@eplant/views/ChromosomeViewer/types'

// Global


// --------------
// Event Listeners
// --------------
export const addNodeListener = (cy: Core) => {
  cy.on('mouseover', 'node', (event) => {
    const nodeId = event.target.data('id')
    // Check that the node is not a compound node
    if (nodeId !== 'COMPOUND_DNA' && nodeId !== 'COMPOUND_PROTEIN') {
      if (nodeId.substring(0, 3) === 'chr') {
        chrNodeMouseOverHandler(cy, event)
      } else {
        nodeMouseOverHandler(cy, event)
      }
    }
  })
}

export const addEdgeListener = (cy: Core) => {
  // Listen for pointer events on edges
  cy.on('mouseover', 'edge', (event) => {
    // No tooltip on chr edges
    if (event.target._private.classes.values().next().value == 'chr-edge') {
      return false
    }
    edgeMouseOverHandler(cy, event)
  })
}

// --------------
// Event Handlers
// --------------
// Handle load gene button click
// Tried to set jotai geneticElements atom from outside react component --> I beleieve it is impossible due to the limits of jotai copabilities
/* class LoadGene {
    geneticElements = useGeneticElements()
    setGeneticElements = useSetGeneticElements()
    activeGeneId = useActiveGeneId()
    setActiveGeneId = useSetActiveGeneId()

    public handleLoadGeneClick = (gene: GeneticElement) => {
        if (gene != null) {
            const geneticElement = new GeneticElement(
                gene.id,
                gene.annotation,
                arabidopsis,
                gene.aliases
            )
            this.setGeneticElements([...this.geneticElements[0], geneticElement])
            this.setActiveGeneId(geneticElement.id)
        }
    }
} */


// Handle regular node hover
const nodeMouseOverHandler = (cy: Core, event) => {
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

          content.innerHTML = `<style>
                                            .tooltip {
                                            padding: 8px;
                                            background: white;
                                            minHeight: 100px;
                                            maxHeight: 200px
                                            width: 200px;
                                            font-size: 10px;
                                            color: black;
                                            border: 1px solid black;
                                            }
                                            label {
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
                                                        ${gene.aliases.length > 0 ? gene.aliases.slice(0, 3) : 'N/A'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label>Annotation: </label></td>
                                                    <td>
                                                        ${gene.annotation != '' ? gene.annotation : 'N/A'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><button onclick={title='Load gene into collection'>Load Gene</button>
                                                </tr>
                                            </table>
                                        </div>`
          const props = {
            content: content, duration: 200, arrow: false, followCursor: false, interactive: true
          }
          return props
        }
      })

      tip.show()
      destroyTip(cy, tip)
    })
}
// Handle edge hover
const edgeMouseOverHandler = (cy: Core, event) => {
  const edge = event.target
  const data = edge._private.data
  const references =
    data.reference != 'None'
      ? generateLinks(data.reference).map((link, i) => `<a href=${link}>${link}</a>\n`)
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
        content: content, duration: 1000, arrow: true, followCursor: true, interactive: false
      }
      return props
    }
  })
  tip.show()
  destroyTip(cy, tip)
}

// Handler chr node hover
const chrNodeMouseOverHandler = (cy: Core, event) => {
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
                    }
                    label {
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
        content: content, duration: 200, arrow: false, followCursor: false, interactive: true
      }
      return props
    }
  })
  tip.show()

  destroyTip(cy, tip)
}




const destroyTip = (cy: Core, tip: PopperInstance) => {
  // add handler to node for mouse leave
  cy.on('mouseout', 'node', (event) => {
    const nodeID = event.target.data('id')
    if (nodeID !== 'COMPOUND_DNA' && nodeID !== 'COMPOUND_PROTEIN') {
      tip.destroy()
    }
  })
  // add handler to edge for mouse leave
  cy.on('mouseout', 'edge', (event) => {
    tip.destroy()
  })
}

// --------
// Helpers
// --------
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
