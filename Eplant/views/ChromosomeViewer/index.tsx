import React, { useState } from 'react'

import { useSpecies } from '@eplant/state'

import { View, ViewProps } from '../../View'

import ChromosomeView from './ChromosomeView';
import ChromosomeIcon from './icon';
import { ChromosomeList, ChromosomesResponseObj } from './types';


const ChromosomeViewer: View = {

	name: 'Chromosome Viewer',
	id: 'chromosome-viewer',
	component() {
		const [chromosomes, setChromosomes] = useState<ChromosomeList>([{
			id: "",
			name: "",
			size: 0,
			centromeres: []
		}]);
		async () => {
			const response: Response = await fetch(
				`https://bar.utoronto.ca/eplant/cgi-bin/chromosomeinfo.cgi?species=${species}`
			);
			if (response.ok) {
				const responseObj: ChromosomesResponseObj = await response.json();
				const chromosomeViewData: ChromosomeList = responseObj["chromosomes"];
				setChromosomes(chromosomeViewData);
			}
		}
		return <ChromosomeView chromosomes={chromosomes}></ChromosomeView>
	},
	icon: () => <ChromosomeIcon />,
	description: 'Chromosome Viewer.',
	citation() {
		return <div></div>
	},
	async getInitialData() {
		console.log(useSpecies()[0])

	},

}
export default ChromosomeViewer