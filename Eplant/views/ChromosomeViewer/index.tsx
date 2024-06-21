import React, { useState } from 'react'

import GeneticElement from '@eplant/GeneticElement';
import { useSpecies } from '@eplant/state';

import { View, ViewProps } from '../../View'

import ChromosomeView from './Viewer/ChromosomeView';
import { ChromosomeIcon } from './icons';
import {
	ChromosomeList,
	ChromosomesResponseObj,
	ChromosomeViewerAction,
	ChromosomeViewerData,
	ChromosomeViewerState
} from './types';


const ChromosomeViewer: View<ChromosomeViewerData> = {

	name: 'Chromosome Viewer',
	id: 'chromosome-viewer',
	async getInitialData(
		gene: GeneticElement | null,
		loadEvent: (progress: number) => void

	) {
		let chromosomeViewData: ChromosomeList = [{
			id: "Chr333",
			name: "Chr",
			size: 0,
			centromeres: []
		}];

		const species = "Arabidopsis_thaliana"
		const url = `https://bar.utoronto.ca/eplant/cgi-bin/chromosomeinfo.cgi?species=${species}`
		chromosomeViewData = await fetch(url).then(async (response) => {
			console.log(response)

			return response.json()
		}).then((responseObj: ChromosomesResponseObj) => responseObj["chromosomes"])

		return chromosomeViewData
	},
	component({
		activeData,
		state,
		dispatch,
		geneticElement
	}: ViewProps<ChromosomeViewerData, ChromosomeViewerState, ChromosomeViewerAction>) {

		console.log("test chromosomeView component props ->", activeData, geneticElement)
		return <ChromosomeView chromosomes={activeData} geneticElement={geneticElement}></ChromosomeView>
	},
	icon: () => <ChromosomeIcon />,
	description: 'Chromosome Viewer.',
	citation() {
		return <div></div>
	}

}
export default ChromosomeViewer