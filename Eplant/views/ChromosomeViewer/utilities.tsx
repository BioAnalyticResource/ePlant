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
