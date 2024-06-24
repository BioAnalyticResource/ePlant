import React, { useState } from 'react'

import GeneticElement from '@eplant/GeneticElement';
import { useSpecies } from '@eplant/state';
import PanZoom from '@eplant/util/PanZoom';
import useTheme from "@mui/material/styles/useTheme";
import Typography from '@mui/material/Typography';

import { View, ViewProps } from '../../View'

import ChromosomeView from './Viewer/Viewer';
import { ChromosomeIcon } from './icons';
import {
	ChromosomeList,
	ChromosomesResponseObj,
	ChromosomeViewerAction,
	ChromosomeViewerData,
	ChromosomeViewerState
} from './types';


const ChromosomeViewer: View<ChromosomeViewerData, ChromosomeViewerState, ChromosomeViewerAction> = {

	name: 'Chromosome Viewer',
	id: 'chromosome-viewer',
	getInitialState(): ChromosomeViewerState {
		return {
			transform: {
				offset: {
					x: 0,
					y: 0,
				},
				zoom: 0.4,
			},
		}
	},
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

		const species = "Populus_trichocarpa"
		const url = `https://bar.utoronto.ca/eplant/cgi-bin/chromosomeinfo.cgi?species=${species}`
		chromosomeViewData = await fetch(url).then(async (response) => {
			console.log(response)

			return response.json()
		}).then((responseObj: ChromosomesResponseObj) => responseObj["chromosomes"])

		return {
			viewData: chromosomeViewData,
			transform: {
				offset: { x: 0, y: 0 },
				zoom: 1,
			},
		}
	},
	component({
		activeData,
		state,
		dispatch,
		geneticElement
	}: ViewProps<ChromosomeViewerData, ChromosomeViewerState, ChromosomeViewerAction>) {
		const theme = useTheme()

		console.log("test chromosomeView component props ->", activeData, geneticElement)
		return (
			<>
				<Typography variant="h6" sx={{}}>Chromosome Viewer</Typography>

				<PanZoom
					sx={(theme) => ({
						position: 'absolute',
						top: theme.spacing(0),
						left: theme.spacing(0),
						width: '100%',
						height: '100%',
						zIndex: 0,
					})}
					transform={state.transform}
					onTransformChange={(transform) => {
						dispatch({
							type: 'set-transform',
							transform,
						})
					}}
				>
					<ChromosomeView chromosomes={activeData} geneticElement={geneticElement}></ChromosomeView>
				</PanZoom>
			</>
		)
	},
	actions: [
		{
			action: { type: 'reset-transform' },
			render: () => <>Reset pan/zoom</>,
		},
	],
	reducer: (state, action) => {
		switch (action.type) {

			case 'set-transform':
				return {
					...state,
					transform: action.transform,
				}
			case 'reset-transform':
				return {
					...state,
					transform: {
						offset: { x: 0, y: 0 },
						zoom: 1,
					},
				}
			default:
				return state
		}
	},
	icon: () => <ChromosomeIcon />,
	description: 'Chromosome Viewer.',
	citation() {
		return <div></div>
	}

}
export default ChromosomeViewer