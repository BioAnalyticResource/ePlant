import GeneticElement from "@eplant/GeneticElement"

/* Level 1 - API results */
export interface Interaction {
	source: string
	target: string
	index: string
	interolog_confidence: number
	correlation_coefficient: number
	published: boolean
	reference: string
	recursive?: string
}
export interface SublocalizationData {
	'unclear'?: number,
	'cytosol'?: number,
	'mitochondrion'?: number,
	'plastid'?: number,
	'vacuole'?: number,
	'nucleus'?: number,
	'endoplasmic reticulum'?: number,
	'extracellular'?: number,
	'golgi'?: number,
	'plasma membrane'?: number,
	'peroxisome'?: number
}
export interface Sublocalization {
	id: string
	includes_predicted: string
	includes_experimental: string
	data?: any
}
/* Level 2 - Nodes and Edges */
export interface NodeItem {
	data: NodeData
	group?: string
	classes?: string
	position?: {
		x: number
		y: number
	}
}
export interface Edge {
	data: EdgeData
	classes: string
}

export interface NodeData {
	id: string
	parent?: string
	content?: string
	geneticElement?: GeneticElement
	genes?: string[]
	pie1Size?: number
	pie2Size?: number
	pie3Size?: number
	pie4Size?: number
	pie1Colour?: string
	pie2Colour?: string
	pie3Colour?: string
	pie4Colour?: string
	height?: string
	width?: string
	borderWidth?: number
}

export interface EdgeData {
	source: string
	target: string
	tooltip: string
	type: string
	method: string
	correlation?: number
	interolog_conf?: number
	reference?: string
	size?: number
	lineStyle?: string
	lineColor?: string
	arrowColor?: string
}

/* Cytoscape */
export interface ViewData {
	nodes: NodeItem[]
	edges: Edge[]
	loadFlags: LoadFlags
}
export type CyInteraction = NodeItem | Edge

export interface LoadFlags {
	empty: boolean
	existsPDI: boolean
	existsPPI: boolean
	recursive: boolean
}


// InteractionsViewer component
export type InteractionsViewData = {
	viewData: ViewData
}
export type InteractionsViewState = null
export type InteractionsViewAction = null