/** @format */

import { NodeItem, Sublocalization } from '../types'

let nodes: NodeItem[] = []

/* Main function */
const loadSublocalizations = (cyConfNodes: NodeItem[]) => {
	nodes = cyConfNodes
	let data = []
	loadData().then((expData) => {
		data = expData
		nodes = setSublocalizations(data)

	})
	return nodes

}
export default loadSublocalizations
/**
 * Set the sublocalization for each pie node
 * @param {Object} data JSON sublocalization object from webservice
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
		const sublocData = data.filter(item => {
			return item.id === id
		})[0]
		const topLocals = sublocData ? getTopSublocals(sublocData) : []
		const predicted = sublocData ? sublocData.includes_predicted : true
		// @ts-ignore
		const node = setSublocalizationStyle(topLocals, predicted === 'yes', backNodes[n])
		newNodes.push(node)
	}
	return newNodes
}

/**
 * Gets sublocalization data from webservice
 * @param  {Function} resolve Promise resolve function
 * @return {void}
 */
const loadData = async () => {
	// Get all protein ids
	const ids = []
	for (let n = 0; n < nodes.length; n++) {
		const id = nodes[n].data.id.substring(0, 9)
		const type = nodes[n].data.id.substring(9)

		if (type === 'PROTEIN_NODE' || type === 'QUERY_NODE') {
			ids.push(id)
		}
	}

	let expData: Sublocalization[] = []
	// URL for sublocalization webservices
	const urlSUBA = 'https://bar.utoronto.ca/eplant/cgi-bin/groupsuba4.php'
	// fetch sublocalizations, do not include predicted
	await fetch(urlSUBA, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},

		body: JSON.stringify({
			AGI_IDs: ids,
			include_predicted: false
		})
	}).then(response => response.json()).then(async (json) => {
		expData = json
		const predIds = [] // ids of genes without experimental data
		for (let i = 0; i < expData.length; i++) {
			// Get genes without experimental data to re-query
			if (expData[i].includes_experimental === 'no') {
				predIds.push(expData[i].id)
			}
		}
		if (predIds.length === 0) {
			return expData
		}

		let predictedData: Sublocalization[] | [] = []
		// fetch sublocalizations, include predicted
		await fetch(urlSUBA, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				AGI_IDs: predIds,
				include_predicted: true
			})
		}).then(response => response.json()).then((json) => {
			predictedData = json
			for (let k = 0; k < expData.length; k++) {
				const subLoc = expData[k]

				// Use predicted data for genes without experimental data
				if (subLoc.includes_experimental === 'no') {
					const predicted = predictedData.filter(function (item) {
						return item.id === subLoc.id
					})[0]
					subLoc.data = predicted.data
					subLoc.includes_predicted = 'yes'
				}
			}
		})
	})
	return expData
}

/**
 * Return the top 4 sublocalizations of each node
 * @param  {Object} data The sublocalization data for one gene
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
 * @param {Boolean} pred Whether sublocalizations are predicted
 * @param {Object} node Pie protein node
 * @return {Object} The update pie node
 */
const setSublocalizationStyle = (sublocalizations: [], predicted: boolean, node: NodeItem) => {
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
	node.data.borderWidth = predicted ? 0 : 4

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
		'cytoskeleton': '#FF2200',
		'cytosol': '#E04889',
		'endoplasmic reticulum': '#D0101A',
		'extracellular': '#6D3F1F',
		'golgi': '#A5A417',
		'mitochondrion': '#41ABF9',
		'nucleus': '#0032FF',
		'peroxisome': '#660066',
		'plasma membrane': '#ECA926',
		'plastid': '#179718',
		'vacuole': '#F6EE3C'
	}

	// Get color
	let color = map[compartment]
	if (!color) {
		color = '#787878'
	}

	// Return color
	return color
}
