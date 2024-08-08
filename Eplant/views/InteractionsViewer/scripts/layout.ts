/** @format */

import { Core } from 'cytoscape'

import { LoadFlags } from '../types'
/**
 * Used to lay out nodes. DNA nodes are positioned in alignment, while
 * protein nodes are positioned by layout.
 * @returns {void}
 */
let cy: Core;
let loadFlags: LoadFlags;

const setLayout = (cytoscape, flags: LoadFlags) => {
	cy = cytoscape
	loadFlags = flags
	if (!loadFlags.empty && cy != null) {
		if (cy.nodes('[id $= "PROTEIN_NODE"]').length > 0) {
			positionProtein()
		} //else {cb();} ?? dont know what this does
		if (loadFlags.existsPDI) {
			//this.positionDNA();
			positionChr()
		}
	}
	// Use Cytoscape Automove to make protein compounds move in sync
	cy.automove({
		nodesMatching: node => {
			const type = node._private.data.id.substring(9)
			return type === 'PROTEIN_NODE' || type === 'QUERY_NODE'
		},
		reposition: node => {
			const pos = node.position()
			// Set the back node to have the same position
			const backNode = node.siblings()
			backNode.position(pos)
			return pos
		},
		when: 'matching'
	})
	cy.minZoom(0.5)
	cy.fit()
}
export default setLayout

/**
 * Calls layout on protein nodes.
 * @returns {void}
 */
const positionProtein = () => {
	// get nodes
	const proteinNodes = cy.nodes('[id $= "PROTEIN_NODE"]')
	if (loadFlags.existsPDI || proteinNodes.length < 100) {
		// Layout proteins for PDI
		const layout = proteinNodes
			.layout({
				name: 'cose-bilkent',
				// Whether to fit the network view after when done
				fit: false,
				// Node repulsion (non overlapping) multiplier
				nodeRepulsion: 5000,
				// Maximum number of iterations to perform
				numIter: 7500,
				// For enabling tiling (Must be false, or error occurs)
				tile: false,
				// Type of layout animation. The option set is {'during', 'end', false}
				animate: false,
				randomize: true,
				// Stop callback
				stop: function () {
					transformAverage(proteinNodes, loadFlags.existsPDI)
					positionProteinBack(proteinNodes)
					// cb(); ??
				}
			})
			.run()
	} else {
		const layout = proteinNodes
			.layout({
				name: 'cose-bilkent',
				fit: true,
				randomize: true,
				stop: function () {
					transformAverage(proteinNodes, false)
					positionProteinBack(proteinNodes)
					// cb() ??
				}
			})
			.run()
	}
}

/**
 * Updates the position of protein back nodes to be the same as protein node bodies.
 * @param  {Collection} nodes The collection of node bodies
 * @return {void}
 */
const positionProteinBack = nodes => {
	for (let i = 0; i < nodes.length; i++) {
		const position = nodes[i]._private.position
		const id = nodes[i]._private.data.id.substring(0, 9)
		cy.$('#' + id + 'PROTEIN_BACK').position(position)
	}
}
/**
 * Positions Chr nodes
 * @return {void}
 */
const positionChr = () => {
	// Get DNA nodes
	const chrNodes = cy.$('[id ^= "chr"]')
	// Get DNA node positions
	const chrPositions = positionDNALinear(chrNodes.length)
	// Update position
	for (let i = 0; i < chrNodes.length; i++) {
		const x = chrPositions[i][0]
		const y = chrPositions[i][1]
		const id = '#' + chrNodes[i]._private.data.id
		cy.$(id).position({ x: x, y: y })
	}
}





// ----------------
// Helper functions
// ----------------
/**
 * Transform the collection of protein nodes to an area to the average right of the query node.
 *
 * @param  {Array} nodes The array of nodes to transform
 * @param  {Boolean} offset Controls whether nodes are offset off query x position
 * @return {void}
 */
const transformAverage = (nodes, offset) => {
	let minX = 10000
	let maxY = -10000
	let minY = 10000

	let avgX = 0
	let avgY = 0

	// Get range and average of values
	for (let n = 0; n < nodes.length; n++) {
		const posX = nodes[n].position('x')
		const posY = nodes[n].position('y')
		minX = posX < minX ? posX : minX
		minY = posY < minY ? posY : minY
		maxY = posY > maxY ? posY : maxY

		avgX += posX
		avgY += posY
	}

	const shiftX = 100 > minX ? 100 - minX : 0
	avgX = offset ? shiftX : avgX / nodes.length
	avgY = avgY / nodes.length

	//BEN CHANGED
	// Transform positions
	//nodes.positions(function (i, node) {
	nodes.positions(function (node, i) {
		const curX = node.position('x')
		const curY = node.position('y')
		return {
			x: offset ? curX + avgX : curX - avgX,
			y: curY - avgY
		}
	})
}
/**
 * Determines Y coordinate for individual nodes with even spacing
 *
 * @param {Number} numNodes The amount of nodes to be positioned
 * @return {List} coordinates The calculated (x, y) coordinates
 */
const positionDNALinear = (numNodes) => {
	const x = -350
	const midpoint = 0
	let coordinates: Array<Array<number>> = []
	const increment = 100
	// Assign values to coordinates
	if (numNodes <= 0) {
		// Return empty coords
		coordinates = []
	} else if (numNodes === 1) {
		// Return midpoint
		coordinates.push([x, midpoint])
	} else if (numNodes % 2 === 0) {
		// Adds coordinates symmetrically from the midpoint.
		// The midpoint is placed between the two middle coordinates.
		for (let n = 0; n < numNodes / 2; n++) {
			coordinates.push([x, 50 + n * increment])
			coordinates.unshift([x, -50 - n * increment])
		}
	} else {
		// Add aligned center node
		coordinates.push([x, midpoint])
		// Adds coordinates symmetrically from the midpoint.
		for (let k = 1; k <= Math.floor(numNodes / 2); k++) {
			coordinates.push([x, midpoint + k * increment])
			coordinates.unshift([x, midpoint - k * increment])
		}
	}
	return coordinates
}

/**
 * Generates the coordinates to lay out DNA nodes in a semicircle
 * @param {Number} numNodes The number of nodes to lay out
 * @returns {Array} The computed coordinate array [(x,y)..] in a semi-circle
 */
const positionDNACircular = (numNodes) => {
	// Set bounds for semi-circle (in radians)
	let topLimit
	let bottomLimit
	if (numNodes > 80) {
		// Increase arc size past vertical if many nodes
		topLimit = Math.PI / 2 - Math.PI / 8
		bottomLimit = Math.PI * 1.5 + Math.PI / 8
	} else {
		topLimit = Math.PI / 2
		bottomLimit = Math.PI * 1.5
	}

	// Angle in radians between nodes
	const increment = (bottomLimit - topLimit) / numNodes

	// Rows of nodes to stagger
	let rows = 2
	if (numNodes > 75) {
		rows += 1 + Math.floor(numNodes / 80)
	}
	// Counter to track current row
	let j = 1

	// Final array of x,y coordinates of nodes
	const coordArray: Array<Array<number>> = []

	for (let i = topLimit; i < bottomLimit; i += increment) {
		// Determine radius and distance between nodes
		let radius
		let separationWeight
		if (numNodes > 400) {
			radius = (10 - rows) * numNodes
			separationWeight = 1 + rows * 0.1
		} else if (numNodes > 100) {
			radius = (10 - 1.1 * rows) * numNodes
			separationWeight = 1 + rows * 0.1
		} else {
			radius = 7.5 * numNodes
			separationWeight = 1 + rows * 0.3
		}
		// Stagger rows, weight radius by number of nodes
		// NOTE: can implement switch case here
		if (j % rows === 7) {
			radius += separationWeight * 315
		} else if (j % rows === 6) {
			radius += separationWeight * 270
		} else if (j % rows === 5) {
			radius += separationWeight * 225
		} else if (j % rows === 4) {
			radius += separationWeight * 180
		} else if (j % rows === 3) {
			radius += separationWeight * 135
		} else if (j % rows === 2) {
			radius += separationWeight * 90
		} else if (j % rows === 1) {
			radius += separationWeight * 45
		}
		j++
		coordArray.unshift(trigCalculator(radius, i))
	}
	return coordArray
}

/**
 * Generates the x-y coordinates of nodes using trigonometry
 * @param {Number} radius The radius of the interaction edge
 * @param {Number} angle The angle of the interaction edge in radians
 * @returns {Tuple} Returns a tuple of (x, y)
 */
const trigCalculator = (radius: number, angle: number) => {
	const xCoord = radius * Math.cos(angle)
	const yCoord = radius * Math.sin(angle)
	return [xCoord, yCoord]
}
