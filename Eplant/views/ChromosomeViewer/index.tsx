import React, { useState } from 'react'

import { View } from '../../View'

import ChromosomeView from './Viewer/ChromosomeView';
import ChromosomeIcon from './icon';
import { ChromosomeList, ChromosomesResponseObj, ChromosomeViewerData } from './types';


const ChromosomeViewer: View<ChromosomeViewerData> = {

	name: 'Chromosome Viewer',
	id: 'chromosome-viewer',
	async getInitialData() {
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
	component({ activeData }) {
		console.log("test chromosome view component -> activeData prop", activeData)
		return <ChromosomeView chromosomes={activeData}></ChromosomeView>
	},
	icon: () => <ChromosomeIcon />,
	description: 'Chromosome Viewer.',
	citation() {
		return <div></div>
	}

}
export default ChromosomeViewer