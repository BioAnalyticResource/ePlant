import sleep from "sleep-promise";

import GeneticElement from "@eplant/GeneticElement";

import { GeneItem } from "./types";



/*
delay function to set timeout
 */
export const delay = (ms: number) => new Promise(

	resolve => {
		console.log("heello");
		setTimeout(resolve, ms)
	}
);


/**
 * takes object of type GeneticElement and converts it to type GeneItem. uses fetch api to get the GeneItem element from gene id
 *
 * @return {GeneItem} gene .
 */
export const fetchGeneItem = async (geneId: string) => {
	const response = await fetch(
		`https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=${geneId}`
	)
	const gene = await response.json()
	return gene
}