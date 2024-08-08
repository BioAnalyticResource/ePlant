/** @format */
import GeneticElement, { Species } from '@eplant/GeneticElement'

import { Edge, Interaction, LoadFlags, NodeItem } from '../types'

import loadSublocalizations from './loadSublocalizations'
let query = ''
let geneticElement: GeneticElement;
let loadFlags: LoadFlags = {
	empty: true,
	existsPDI: false,
	existsPPI: false,
	recursive: false
}
let nodes: NodeItem[];
let edges: Edge[];

/* Main function */
const loadViewData = (gene: GeneticElement, data: Interaction[], recursive: string) => {
	nodes = []
	edges = []
	query = gene.id.toUpperCase()
	geneticElement = gene
	getLoadFlags(data, recursive)
	loadInteractions(data)
	nodes = loadSublocalizations(nodes)

	return {
		nodes: nodes,
		edges: edges,
		loadFlags: loadFlags
	}
}
export default loadViewData

// -----------------
// Level 1 functions
// -----------------
/**
 *  Get flags used in futher loading
 * * empty{boolean}: Whether interactions exist in data
 * * existsPDI{boolean}: Whether protein-dna interactions exist in data
 * * existsPPI{boolean}: Whether protein-protein interactions exist in data
 * * recursive{boolean}: Whether data includes recursive interactions
 * @param  {Object} data JSON format interaction data
 * @return {Object} flags
 *
 */
const getLoadFlags = (data: Interaction[], recursive: string) => {
	const flags = {
		empty: checkEmpty(data),
		existsPDI: checkExistsPDI(data),
		existsPPI: checkExistsPPI(data),
		recursive: checkRecursive(data, recursive)
	}
	loadFlags = flags
}
/**
 * Convert interactions from JSON to cytoscape node/edges without PDIs
 * @param  {Object} data Interaction data from JSON
 * @return {void}
 */
const loadInteractions = (data: Interaction[]) => {
	if (!loadFlags?.recursive) {
		createRecursiveLabel()
	}
	if (!loadFlags.empty) {
		// Create top level compound nodes
		if (loadFlags.existsPDI) {
			createCompoundDNA()
			if (loadFlags.existsPPI) {
				createCompoundProtein()
			}
		}

		// Load interactions
		if (loadFlags.existsPDI) {
			loadInteractionsChr(data)
		} else {
			loadInteractionsNoDNA(data)
		}
	} else {
		createQueryNode(query)
		createNoInteractionNode()
	}
}
const loadInteractionsChr = (data: Interaction[]) => {
	createQueryNode(query)
	createChromosomes(data)
	const createFunctions = [createSelfQPI, createQPI, createPPI, createChr]
	createInteractions(createFunctions, data)
}
/**
 * Convert interactions from JSON to cytoscape node/edges without PDIs
 * @return {void}
 */
const loadInteractionsNoDNA = (data: Interaction[]) => {
	createQueryNode(query)
	const createFunctions = [createSelfQPI, createQPI, createPPI]

	createInteractions(createFunctions, data)
}

// ------------------------------------
// Helper functions for State
// ------------------------------------
/* const nodesPush = (node: NodeItem) => {
	const newNodes = nodes
	newNodes.push(node)
	setNodes(newNodes)
}
const edgesPush = (edge: Edge) => {
	const newEdges = edges
	newEdges.push(edge)
	setEdges(newEdges)
}
*/
// ------------------------------------
// Level 2 Functions
// ------------------------------------
/**
 * Creates interactions using creation functions
 * @param  {Array} funcArr Array of functions which to call to construct graph
 * @return {void}
 */
const createInteractions = (funcArray: Array<(data: Interaction) => boolean>, data: Interaction[]) => {
	data = data.slice()
	for (let n = 0; n < funcArray.length; n++) {
		const addedIndices = []
		for (let i = 0; i < data.length - 1; i++) {
			const re = /^At[\dCM]g\d{5}$/i
			if (re.test(data[i].source) && re.test(data[i].target) && funcArray[n](data[i])) {
				addedIndices.unshift(i)
			}
		}

		for (let k = 0; k < addedIndices.length; k++) {
			data.splice(addedIndices[k], 1)
		}
	}

	if (data.length > 1) {
		console.log(data)
		console.error('Error: ' + data.length + ' interactions not processed.')
	}
}
/**
 * Create nodes for chromosomal nodes
 * @return {void}
 */
const createChromosomes = (data: Interaction[]) => {
	const chrs: string[] = []
	const chrNums: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
	const methods: Record<string, string> = { '1': 'P', '2': 'P', '3': 'P', '4': 'P', '5': 'P', 'C': 'P', 'M': 'P' }
	for (let k = 0; k < data.length - 1; k++) {
		const chr = data[k].target.substring(2, 3)
		if (data[k].index === '2') {
			chrNums[chr]++
			if (!chrs.includes(chr)) {
				chrs.push(chr)
			}
		}
		// Method
		if (data[k].index === '2' && data[k].published == true) {
			methods[chr] = 'E'
		}
	}
	for (const chr in chrNums) {
		if (chrNums[chr] === 0) delete chrNums[chr]
	}

	let i = 0
	for (const c in chrNums) {
		createChromosomeNode(chrs[i], chrNums[c])
		createChromosomeEdge(chrs[i], methods[c])
		i++
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++
// Node creators
// ------------
/**
 * Creates top level dna compound node
 * @return {void}
 */
const createCompoundDNA = () => {
	const dnaCompound = {
		group: 'nodes',
		data: {
			id: 'COMPOUND_DNA'
		},
		classes: 'compound-top'
	}
	//nodesPush(dnaCompound)
	nodes.push(dnaCompound)
}

/**
 * Creates top level protein compound node
 * @return {void}
 */
const createCompoundProtein = () => {
	const proteinCompound = {
		group: 'nodes',
		data: {
			id: 'COMPOUND_PROTEIN'
		},
		classes: 'compound-top'
	}
	//nodesPush(proteinCompound)
	nodes.push(proteinCompound)
}

/**
 * Create the query node; the one which user has entered
 * @param  {String} query ID of query gene
 * @return {void}
 */
const createQueryNode = (query: string) => {
	const compound = {
		group: 'nodes',
		data: {
			id: query + 'QUERY_COMPOUND'
		},
		classes: 'protein-compound'
	}

	const border = {
		group: 'nodes',
		data: {
			id: query + 'QUERY_BACK',
			parent: query + 'QUERY_COMPOUND'
		},
		classes: 'protein-back'
	}

	const node = {
		group: 'nodes',
		data: {
			id: query + 'QUERY_NODE',
			content: query,
			geneticElement: geneticElement,
			parent: query + 'QUERY_COMPOUND'
		},
		classes: 'protein-node loaded'
	}
	//nodesPush(compound)
	//nodesPush(border)
	//nodesPush(node)
	nodes.push(compound, border, node)
}
/**
 * Create Protein Nodes. Consists of three nodes: regular protein body, a pie node for border,
 * and a compound container to keep nodes together.
 * @param  {String} id ID of gene to represent
 * @return {Object} Node object
 */
const createProteinNode = (id: string) => {
	id = id.toUpperCase()
	const newGeneticElement = geneticElement
	// let newGeneticElement = geneticElement.species.api.searchGene(id)
	const compound = {
		group: 'nodes',
		data: {
			id: id + 'PROTEIN_COMPOUND',
			parent: ''
		},
		classes: 'protein-compound'
	}

	const border = {
		group: 'nodes',
		data: {
			id: id + 'PROTEIN_BACK',
			parent: id + 'PROTEIN_COMPOUND'
		},
		classes: 'protein-back'
	}

	const node = {
		group: 'nodes',
		data: {
			id: id + 'PROTEIN_NODE',
			content: id,
			geneticElement: newGeneticElement,
			parent: id + 'PROTEIN_COMPOUND'
		},
		classes: 'protein-node'
	}

	if (loadFlags.existsPDI) {
		compound.data.parent = 'COMPOUND_PROTEIN'
	}
	// if (gene && gene.isLoadedViews) {
	// 	node.classes = 'protein-node loaded'
	// }
	/* 	nodesPush(compound)
	nodesPush(border)
	nodesPush(node)
	*/
	nodes.push(compound, border, node)
	return { compound: compound, border: border, node: node }
}

/**
 * Create no interactions node
 * @return {void} Node object
 */
const createNoInteractionNode = () => {
	const noInteractionNode = {
		group: 'nodes',
		data: {
			id: 'noInteractionLabel'
		},
		position: {
			x: 0,
			y: 400
		}
	}
	//nodesPush(noInteractionNode)
	nodes.push(noInteractionNode)
}

/**
 * Create chromosomal node
 * @param {Number} id Chromosomal number
 * @param {Number} n Protein DNA interactions number
 * @return {Object} Node object
 */
const createChromosomeNode = (id: string, n: number) => {
	const node = {
		data: {
			id: 'chr' + id,
			content: 'Chr ' + id + ': ' + n + ' PDIs',
			parent: 'COMPOUND_DNA',
			genes: []
		},
		classes: 'dna-node'
	}
	//nodesPush(node)
	nodes.push(node)
	return { node: node }
}

// +++++++++++++++++++++++++++++++++++
// Edge Creators and Helper Functions
//------------

// Creators
/**
 * Create edges representing PPIs
 * @param  {Object} data JSON interaction data
 * @return {void}
 */
const createProteinEdge = (data: Interaction) => {
	// Gets method used to determine interaction
	const method = data.reference === 'None' ? 'P' : 'E'

	let source = data.source.toUpperCase()
	let target = data.target.toUpperCase()

	source = source === query ? source + 'QUERY_NODE' : source + 'PROTEIN_NODE'
	target = target === query ? target + 'QUERY_NODE' : target + 'PROTEIN_NODE'

	let edge = {
		data: {
			source: source,
			target: target,
			tooltip: '',
			type: 'PPI',
			method: method,
			correlation: data.correlation_coefficient,
			interolog_conf: 0.0,
			reference: 'None',
			// css styles
			size: 0,
			lineStyle: '',
			lineColor: ''
		},
		classes: 'protein-edge'
	}

	if (method === 'P') {
		edge.data.interolog_conf = data.interolog_confidence
	}

	if (data.reference !== 'None') {
		edge.data.reference = data.reference
	}

	edge = setProteinEdgeStyles(edge)
	edge.data.tooltip = setEdgeTooltipContent(edge)
	// edgesPush(edge)
	edges.push(edge)
}

/**
 * Create interaction to chromosomal node
 * Asher: Old function not used anymore
 * @param {Number} id Chromosomal number
 * @param {String} method 'P' | 'E' -> method used to determine interaction
 * @return {void}
 */
const createChromosomeEdge = (id: string, method: string) => {
	let source = geneticElement.id.toUpperCase()
	source = source === query ? source + 'QUERY_NODE' : source + 'PROTEIN_NODE'
	let edge: Edge = {
		data: {
			source: source,
			target: 'chr' + id,
			tooltip: '',
			type: 'PDI',
			method: method,
			// css styles
			size: 0,
			lineStyle: '',
			lineColor: '',
			arrowColor: ''
		},
		classes: 'chr-edge'
	}
	edge = setDNAEdgeStyles(edge)
	edge.data.tooltip = setEdgeTooltipContent(edge)
	// edgesPush(edge)
	edges.push(edge)
}

// Helpers
/**
 * Sets edge styles for protein edges
 * @param {Object} edge The edge object with completed data entry
 * @return {Object} Edge object with styles
 */
const setProteinEdgeStyles = (edge: { data: any; classes: string }) => {
	// Set edge style and size based on confidence
	edge.data.lineStyle = 'solid'
	if (edge.data.method === 'E') {
		edge.data.size = 6
	} else if (edge.data.interolog_conf > 10) {
		edge.data.size = 6
	} else if (edge.data.interolog_conf > 5) {
		edge.data.size = 4
	} else if (edge.data.interolog_conf > 2) {
		edge.data.size = 1
	} else {
		edge.data.lineStyle = 'dashed'
		edge.data.size = 1
	}

	if (edge.data.method === 'E') {
		edge.data.lineColor = '#99CC00'
	} else if (edge.data.correlation > 0.8) {
		edge.data.lineColor = '#B1171D'
	} else if (edge.data.correlation > 0.7) {
		edge.data.lineColor = '#D32E09'
	} else if (edge.data.correlation > 0.6) {
		edge.data.lineColor = '#E97911'
	} else if (edge.data.correlation > 0.5) {
		edge.data.lineColor = '#EEB807'
	} else {
		edge.data.lineColor = '#A0A0A0'
	}

	return edge
}

/**
 * Sets edge styles for DNA edges
 * @param {Object} edge The edge object with completed data entry
 * @return {Object} Edge object with styles
 */
const setDNAEdgeStyles = (edge: Edge) => {
	// Set edge defaults

	if (edge.data.method == 'E') {
		edge.data.lineStyle = 'solid'
		edge.data.size = 6
		edge.data.lineColor = '#669900' // Green
		edge.data.arrowColor = '#669900'
	} else {
		edge.data.lineStyle = 'dashed'
		edge.data.size = 1
		edge.data.lineColor = '#A0A0A0' // Grey
		edge.data.arrowColor = '#A0A0A0'
	}

	return edge
}
/**
 * Generate the tooltip associated with an edge from interaction data
 * @param {Object} edge The cyConf edge object
 * @return {void}
 */
const setEdgeTooltipContent = (edge: Edge) => {
	// First line declaring type
	const typeString = edge.data.type === 'PDI' ? 'DNA' : 'Protein'
	let firstLine = 'Protein-' + typeString + ' Interaction'
	// Add method of determination
	if (edge.data.method === 'E') {
		firstLine += ' (E)'
	} else {
		firstLine += ' (P)'
	}
	// Remaining lines containing data
	let dataLines = ''
	if (edge.data.type !== 'PDI') {
		if (edge.data.method === 'P') {
			dataLines += 'Confidence(Interolog): ' + edge.data.interolog_conf + '<br>'
		}
		dataLines += 'Co-expression coefficient: ' + edge.data.correlation + '<br>'
	}

	const final = firstLine + '<br>' + dataLines
	return final
}
//+++++++++++++++++++++++++++++++++++++
// Create Functions
//----------------
/**
 * Check if a node already exists in the collection of all nodes
 * @param  {String} searchID The ID of the element to be compared against the collection
 * @return {Boolean} Returns true if a node with the same id already exists
 */
const checkNodeExists = (searchID: string) => {
	// Checks if current interaction source exists as a node
	for (let n = 0; n < nodes.length; n++) {
		// Compares interaction with existing node elements
		if (nodes[n].data.id.toUpperCase() === searchID) {
			return true
		}
	}
	return false
}
/**
 * Create interaction from query node to itself.
 * @param  {Object} data Object containing interaction data
 * @return {Boolean} Whether an interaction was created
 */
const createSelfQPI = (data: Interaction) => {
	// Verify that the inputted index is correct
	const index = Number(data.index)
	const sourceID = data.source.toUpperCase()
	const targetID = data.target.toUpperCase()

	// Check if the source and target nodes are the query node
	const isQuerySource = sourceID === query
	const isQueryTarget = targetID === query
	if (index < 2 && isQuerySource && isQueryTarget) {
		createProteinEdge(data)
		return true
	}
	return false
}

/**
 * Create interactions from Query to Proteins.
 *
 * @param  {Object} data The object which contains data for this interaction
 * @return {Boolean} Whether a QPI was created
 */
const createQPI = (data: Interaction) => {
	const index = Number(data.index)
	// Store interaction data
	const sourceID = data.source.toUpperCase()
	const targetID = data.target.toUpperCase()

	// Checks if the source node is the query node
	const isQuerySource = sourceID === query
	// Checks if the target node is the query node
	const isQueryTarget = targetID === query

	// Create interaction if above conditions are met. Interaction must be PPI, and source and
	// target must be different, as self interctions should not be handled.
	if (index < 2 && sourceID !== targetID && (isQuerySource || isQueryTarget)) {
		// Add appropriate identifier tag to source
		let existsSource
		let existsTarget
		if (isQuerySource) {
			existsSource = true
			existsTarget = checkNodeExists(data.target + 'PROTEIN_NODE')
		} else {
			existsSource = checkNodeExists(data.source + 'PROTEIN_NODE')
			existsTarget = true
		}

		// Create source node if not pre-existing
		if (!existsSource) {
			createProteinNode(data.source.toUpperCase())
		}

		// Create target node if not pre-existing
		if (!existsTarget) {
			createProteinNode(data.target.toUpperCase())
		}

		// Create an interaction if not pre-existing
		if (!existsTarget || !existsSource) {
			createProteinEdge(data)
			return true
		}
	}
	return false
}

/**
 * Creates protein-protein interactions which do not include the query node.
 * Must be executed after the createQPI method has run.
 * This ensures that all PPIs will have an origin from a query node rooted protein.
 * This method will include the creation of self PPIs.
 *
 * @param  {Object} data Object containing interaction data
 * @return {Boolean} Whether an interaction was created
 */
const createPPI = (data: Interaction) => {
	const index = Number(data.index)
	// Store interaction data
	const sourceID = data.source.toUpperCase()
	const targetID = data.target.toUpperCase()

	// Checks that both the source and target nodes are pre-existing
	const existsProteinSource = checkNodeExists(sourceID + 'PROTEIN_NODE')
	const existsProteinTarget = checkNodeExists(targetID + 'PROTEIN_NODE')

	// Check that source and target nodes are not the query node
	const existsQuerySource = checkNodeExists(sourceID + 'QUERY_NODE')
	const existsQueryTarget = checkNodeExists(targetID + 'QUERY_NODE')

	const existsQuery = existsQuerySource || existsQueryTarget

	if (index < 2 && (existsProteinSource || existsProteinTarget) && !existsQuery) {
		// Create source node if not pre-existing
		if (!existsProteinSource) {
			createProteinNode(data.source.toUpperCase())
		}

		// Create target node if not pre-existing
		if (!existsProteinTarget) {
			// Create target node
			createProteinNode(data.target.toUpperCase())
		}

		createProteinEdge(data)

		return true
	}
	return false
}

/**
 * Creates DNA interactions assigned to chromosomal nodes
 * @param {Object} JSON data object
 * @return Whether an interaction was created
 */
const createChr = (data: Interaction) => {
	if (data.index !== '2') {
		return false
	}
	const chr = data.target.substring(2, 3)
	const chrNode = nodes.filter(function (item) {
		return item.data.id === 'chr' + chr
	})[0]

	// Predicted DNA
	// Asher
	if (data.published == false && data.index === '2') {
		chrNode.data.genes?.push('<span style="color:#A0A0A0">' + data.target + '</span>')
	} else {
		chrNode.data.genes?.push('<span style="color:#669900">' + data.target + '</span>')
	}
	return true
}
//++++++++++++++++++++++++++++++++++++++
const createRecursiveLabel = () => { }

// ------------------------------------
// Helper functions for getLoadFlags()
// ------------------------------------

/**
 * Returns if protein-dna interactions exists in data
 * @param  {Object} data JSON format interaction data
 * @return {Boolean} Whether PDIs exist in data
 */
const checkExistsPDI = (data: Interaction[]) => {
	if (typeof data == 'undefined') {
		return false
	}
	for (let n = 0; n < data.length - 1; n++) {
		// Checks for PDI interactions, which have an index > 1
		if (Number(data[n].index) > 1) {
			return true
		}
	}
	return false
}

/**
 * Returns if protein-protein interactions exists in data
 * @param  {Object} data JSON format interaction data
 * @return {Boolean} Whether PDIs exist in data
 */
const checkExistsPPI = (data: Interaction[]) => {
	if (typeof data == 'undefined') {
		return false
	}
	for (let n = 0; n < data.length - 1; n++) {
		// Checks for PPI interactions, which have an index < 1
		if (Number(data[n].index) < 2) {
			return true
		}
	}
	return false
}

/**
 * Check if JSON data includes recursive interactions
 * @param  {Array<Object>} data Last object contains recursive data
 * @param  {string} recursive 'yes' or 'no' is data recursive
 * @return {Boolean} Whether data includes recursive interactions
 */
const checkRecursive = (data: string | any[], recursive: string) => {
	if (typeof data == 'undefined') {
		return false
	}
	return recursive === 'true'
}

/**
 * Checks if any interactions exist in data
 * @param  {Object} data JSON format interaction data
 * @return {Boolean} Whether interactions exist
 */
const checkEmpty = (data: Interaction[]) => {
	// check for undefined
	if (typeof data == 'undefined') {
		return true
	}
	return data.length < 2
}
