import { Transform } from "@eplant/util/PanZoom";

// Centromere
export interface CentromereItem {
	id: string;
	start: number;
	end: number;
}
export interface CentromereList extends Array<CentromereItem> { }
// Chromosome
export interface ChromosomeItem {
	id: string;
	name: string;
	size: number;
	centromeres: CentromereList | [];
}
export interface ChromosomeList extends Array<ChromosomeItem> { }
export interface ChromosomesResponseObj {
	"species": string;
	"chromosomes": ChromosomeList;
}

// Genes

export interface GeneItem {
	id: string;
	start: number;
	end: number;
	strand: string;
	aliases: [];
	annotation: string;
}
export interface GeneArray extends Array<GeneItem> { }

// Component Props
export type ChromosomeViewerData = ChromosomeList
export type ChromosomeViewerState = {
	transform: Transform
}
export type ChromosomeViewerAction =
	| { type: 'reset-transform' }
	| { type: 'set-transform'; transform: Transform }



