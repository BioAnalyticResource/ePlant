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
			id: "Chr",
			name: "Chr",
			size: 0,
			centromeres: []
		}];
		const species = "Arabidopsis_thaliana"
		const url = `https://bar.utoronto.ca/eplant/cgi-bin/chromosomeinfo.cgi?species=${species}`
		chromosomeViewData = await fetch(url).then(async (response) => {
			console.log(response)
			debugger
			return response.json()
		}).then((responseObj: ChromosomesResponseObj) => responseObj["chromosomes"])

		return chromosomeViewData
	},
	component({ activeData }) {
		console.log("test chromosome view component -> activeData prop", activeData)
		const [chromosomes, setChromosomes] = useState<ChromosomeList>([
			{
				id: "Chr1",
				name: "Chr 1",
				size: 30427671,
				centromeres: [
					{
						id: "CEN1",
						start: 15086046,
						end: 15087045,
					},
				],
			},
			{
				id: "Chr2",
				name: "Chr 2",
				size: 19698289,
				centromeres: [
					{
						id: "CEN2",
						start: 3607930,
						end: 3608929,
					},
				],
			},
			{
				id: "Chr3",
				name: "Chr 3",
				size: 23459830,
				centromeres: [
					{
						id: "CEN3_1",
						start: 13587787,
						end: 13588786,
					},
					{
						id: "CEN3_2",
						start: 13799418,
						end: 13800417,
					},
					{
						id: "CEN3_3",
						start: 14208953,
						end: 14209952,
					},
				],
			},
			{
				id: "Chr4",
				name: "Chr 4",
				size: 18585056,
				centromeres: [
					{
						id: "CEN4",
						start: 3956022,
						end: 3957021,
					},
				],
			},
			{
				id: "Chr5",
				name: "Chr 5",
				size: 26975502,
				centromeres: [
					{
						id: "CEN5",
						start: 11725025,
						end: 11726024,
					},
				],
			},
			{
				id: "ChrC",
				name: "Chr C",
				size: 154478,
				centromeres: [],
			},
			{
				id: "ChrM",
				name: "Chr M",
				size: 366924,
				centromeres: [],
			},
		]);

		return <ChromosomeView chromosomes={chromosomes}></ChromosomeView>
	},
	icon: () => <ChromosomeIcon />,
	description: 'Chromosome Viewer.',
	citation() {
		return <div></div>
	}

}
export default ChromosomeViewer