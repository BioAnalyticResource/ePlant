/** @format */

import { RawNode, Sublocalization } from '../types'

let nodes: RawNode[] = []

/** Main function to call loadData and then assign the sublocalization colors to the proper nodes
 *
 * @param {RawNode[]} cynodes array of nodes with missing sublocalization data
 * @returns {RawNode[]} array of nodes with proper sublocalization data
 */
const loadSublocalizations = async (cynodes: RawNode[]): Promise<RawNode[]> => {
  nodes = cynodes

  try {
    const data = await loadData()
    const enrichedNodes = setSublocalizations(data)

    return enrichedNodes
  } catch (err) {
    console.error('Failed to load sublocalizations', err)
    return nodes // fallback
  }
}
export default loadSublocalizations

/** Extract protein IDs from nodes
 * @returns {string[]} array of protein ids
 */
const getProteinIds = (): string[] => {
  const ids: string[] = []
  for (let n = 0; n < nodes.length; n++) {
    const id = nodes[n].data.id.substring(0, 9)
    const type = nodes[n].data.id.substring(9)

    if (type === 'PROTEIN_NODE' || type === 'QUERY_NODE') {
      ids.push(id)
    }
  }
  return ids
}
/** Get IDs of genes without experimental data
 * @param {Sublocalization[]} data array of objects containing gene id and sublocalization data
 * @returns {string[]} the predicted gene ids
 */
const getPredictedIds = (data: Sublocalization[]): string[] => {
  return data
    .filter((subLoc) => subLoc.includes_experimental === 'no')
    .map((subLoc) => subLoc.id)
}

/** Get IDs of genes without experimental data
 * @param {Sublocalization[]} expData array of experimental gene ids and corrosponding sublocalization data
 * @param {Sublocalization[]} predictedData array of predicted gene ids and corrosponding sublocalization data
 * @returns {Sublocalization[]} merged experimental and predicted gene ids and corrosponding sublocalization data
 */
const mergeData = (
  expData: Sublocalization[],
  predictedData: Sublocalization[]
): Sublocalization[] => {
  for (let k = 0; k < expData.length; k++) {
    const subLoc = expData[k]
    if (subLoc.includes_experimental === 'no') {
      const predicted = predictedData.find((item) => item.id === subLoc.id)
      if (predicted) {
        subLoc.data = predicted.data
        subLoc.includes_predicted = 'yes'
      }
    }
  }
  return expData
}
/** Load sublocalization data from webservice
 * @returns {Promise<Sublocalization[]>} Promise containing sublocalization array
 */
const loadData = async (): Promise<Sublocalization[]> => {
  const ids = getProteinIds()
  const urlSUBA = 'https://bar.utoronto.ca/eplant/cgi-bin/groupsuba4.php'

  try {
    // Fetch experimental data
    const response = await fetch(urlSUBA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AGI_IDs: ids,
        include_predicted: false,
      }),
    })
    const expData: Sublocalization[] = await response.json()

    // Get predicted IDs
    const predIds = getPredictedIds(expData)

    if (predIds.length === 0) {
      return expData // No predicted data to fetch
    }

    // Fetch predicted data
    const predictedResponse = await fetch(urlSUBA, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AGI_IDs: predIds,
        include_predicted: true,
      }),
    })
    const predictedData: Sublocalization[] = await predictedResponse.json()

    // Merge experimental and predicted data
    return mergeData(expData, predictedData)
  } catch (error) {
    console.error('Error loading data:', error)
    throw error // Re-throw the error to handle it elsewhere
  }
}

/**
 * Set the sublocalization for each pie node
 * @param {Sublocalization[]} data JSON sublocalization object from webservice
 * @return {void}
 */
const setSublocalizations = (data: Sublocalization[]) => {
  const newNodes = []
  const backNodes = []
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].data.id.includes('BACK')) {
      backNodes.push(nodes[i])
    } else {
      newNodes.push(nodes[i])
    }
  }

  for (let n = 0; n < backNodes.length; n++) {
    const id = backNodes[n].data.id.substring(0, 9)
    const sublocData = data.filter((item) => {
      return item.id === id
    })[0]
    const topLocals = sublocData ? getTopSublocals(sublocData) : [] // get top 4 sublocalizations
    const predicted = sublocData ? sublocData.includes_predicted : 'no' // whether gene has predicted data
    const node = setSublocalizationStyle(
      topLocals,
      predicted === 'yes',
      backNodes[n]
    )
    newNodes.push(node)
  }

  return newNodes
}

/**
 * Return the top 4 sublocalizations of each node
 * @param  {Sublocalization} subLoc The sublocalization data for one gene
 * @return {Array} Array of sublocalizations and score
 */
const getTopSublocals = (subLoc: Sublocalization) => {
  const locals = subLoc.data
  // Get the score of sublocalizations
  const arrayLocalization = []
  for (const local in locals) {
    arrayLocalization.push([local, locals[local]])
  }

  // Return top sublocalizations, up to 4
  if (arrayLocalization.length < 5) {
    return arrayLocalization
  }
  // Sort to get largest 4th keys
  arrayLocalization.sort((a, b) => {
    return a[1] - b[1]
  })
  return arrayLocalization.slice(-4)
}

/**
 * Set the cytoscape styles for pie nodes
 * @param {Array} sublocalizations Array of top 4 sublocalizations and score
 * @param {boolean} predicted Whether sublocalizations are predicted
 * @param {RawNode} node Pie protein node
 * @return {Object} The update pie node
 */
const setSublocalizationStyle = (
  sublocalizations: any[][],
  predicted: boolean,
  node: RawNode
) => {
  // Calculate total sum of scores
  let total = 0
  for (let n = 0; n < sublocalizations.length; n++) {
    total += sublocalizations[n][1]
  }
  // Calculate pie size and colours
  const percentages = [100, 0, 0, 0]
  const colour = ['#787878', '#787878', '#787878', '#787878']
  for (let i = 0; i < sublocalizations.length; i++) {
    percentages[i] = (sublocalizations[i][1] * 100) / total
    colour[i] = getColour(sublocalizations[i][0])
  }

  // Set styles
  node.data.pie1Size = percentages[0]
  node.data.pie2Size = percentages[1]
  node.data.pie3Size = percentages[2]
  node.data.pie4Size = percentages[3]
  node.data.pie1Colour = colour[0]
  node.data.pie2Colour = colour[1]
  node.data.pie3Colour = colour[2]
  node.data.pie4Colour = colour[3]
  node.data.height = predicted ? '46px' : '50px'
  node.data.width = predicted ? '46px' : '50px'
  node.data.borderWidth = 0

  return node
}

/**
 * (NOT IN USE) create SVG donut string which will be set as the background image for the node
 * @param {Array} sublocalizations Array of top 4 sublocalizations and score
 * @param {boolean} predicted Whether sublocalizations are predicted
 * @param {RawNode} node Pie protein node
 * @return {Object} The update pie node
 */
const createSVGPieDonutStr = (
  sublocalizations: any[][],
  predicted: boolean,
  node: RawNode
) => {
  const cyNodeSize = 50
  const SVGwidthheight = cyNodeSize + 10
  const donutCxCy = SVGwidthheight / 2
  const strokeWidth = cyNodeSize / 3
  const radius = strokeWidth
  let SVGstr = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>'
  SVGstr += `<svg width="${SVGwidthheight}" height="${SVGwidthheight}" class="donut" xmlns="http://www.w3.org/2000/svg">`
  SVGstr += `<circle class="donut-hole" cx="${donutCxCy}" cy="${donutCxCy}" r="${radius}" fill="transparent"></circle>`

  //The below donut segment will appear for genes without SUBA data... it will be all grey
  SVGstr += `<circle class="donut-unfilled-ring" cx="${donutCxCy}" cy="${donutCxCy}" r="${radius}" fill="transparent" stroke="#56595b" stroke-width="${strokeWidth}" display="block"></circle>`

  // Figure out which 'PCT' properties are greater than zero and then programatically add them
  // as donut-segments. Note that some calculations are involved based
  // on the set node size (the example given on the tutorial is based on a 100px C and 15.91 radius)
  const scaling = radius / 15.91549430918952

  // Calculate total sum of scores
  let total = 0
  for (let n = 0; n < sublocalizations.length; n++) {
    total += sublocalizations[n][1]
  }
  // Calculate pie size and colours
  const pctAndColorArray = [
    { pct: 100, color: '#787878' },
    { pct: 0, color: '#787878' },
    { pct: 0, color: '#787878' },
    { pct: 0, color: '#787878' },
  ]
  for (let i = 0; i < sublocalizations.length; i++) {
    pctAndColorArray[i].pct = (sublocalizations[i][1] * 100) / total
    pctAndColorArray[i].color = getColour(sublocalizations[i][0])
  }

  // Now have pre-sorted pctAndColorArray based on the value of the 'pct' property, order greatest to least
  // Result: Show pie chart values from greatest to least starting from 12 oclock
  let initialOffset = 25 * scaling // Bypass default donut parts start at 3 o'clock instead of 12
  let allSegsLength = 0

  // Based on the sorted array we created above, let's add some 'donut segments' to the SVG string
  pctAndColorArray.forEach((pctAndColor) => {
    SVGstr += `<circle class="donut-segment" cx="${donutCxCy}" cy="${donutCxCy}" r="${radius}"  fill="transparent" stroke="${
      pctAndColor.color
    }" stroke-width="${strokeWidth}" stroke-dasharray="${
      pctAndColor.pct * scaling
    } ${
      (100 - pctAndColor.pct) * scaling
    }" stroke-dashoffset="${initialOffset}" display="block"></circle>`

    allSegsLength += pctAndColor.pct

    // (Circumference − All preceding segments’ total length + First segment’s offset = Current segment offset ) * scaling factor
    initialOffset = (100 - allSegsLength + 25) * scaling // increase offset as we have just added a slice
  })

  SVGstr += '</svg>'
  SVGstr = 'data:image/svg+xml;utf8,' + encodeURIComponent(SVGstr) // Modify for CSS via cytoscape
  node.data.svgDonut = SVGstr // Last, properly mutate the node with our made SVG string
  node.data.height = predicted ? '46px' : '50px'
  node.data.width = predicted ? '46px' : '50px'
  node.data.borderWidth = predicted ? 0 : 4
  console.log(SVGstr)
  return node
}

/**
 * Return a hex colour code representing a compartment
 * @param  {String} compartment The compartment to represent
 * @return {String} The hex colour code
 */
const getColour = (compartment: string): string => {
  // Define color map
  const map: Record<string, string> = {
    cytoskeleton: '#FF2200',
    cytosol: '#E04889',
    'endoplasmic reticulum': '#D0101A',
    extracellular: '#6D3F1F',
    golgi: '#A5A417',
    mitochondrion: '#41ABF9',
    nucleus: '#0032FF',
    peroxisome: '#660066',
    'plasma membrane': '#ECA926',
    plastid: '#179718',
    vacuole: '#F6EE3C',
  }

  // Get color
  let color = map[compartment]
  if (!color) {
    color = '#787878'
  }

  // Return color
  return color
}
