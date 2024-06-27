import sleep from "sleep-promise";

import GeneticElement from "@eplant/GeneticElement";

import { GeneItem } from "./types";

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

export const fetchGeneItemFromGeneticElement = async (geneticElement: GeneticElement) => {
	const response: Response = await fetch(
		`https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=${geneticElement.id}`
	);
	// await sleep(1000)
	const gene: GeneItem = await response.json();
	return gene

}