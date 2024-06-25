import React, { useState } from 'react'
//@ts-ignore
import { MapInteractionCSS } from "react-map-interaction";

import GeneticElement from '@eplant/GeneticElement';
import { useSpecies } from '@eplant/state';
// import PanZoom from '@eplant/util/PanZoom';
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
	ChromosomeViewerState,
	Transform
} from './types';


const ChromosomeViewer: View<ChromosomeViewerData, ChromosomeViewerState, ChromosomeViewerAction> = {

	name: 'Chromosome Viewer',
	id: 'chromosome-viewer',
	getInitialState(): ChromosomeViewerState {
		return {
			value: {
				scale: 0.8,
				translation: {
					x: 0,
					y: 0,
				}
			},
		}
	},
	async getInitialData(
		gene: GeneticElement | null,
		loadEvent: (progress: number) => void
	) {
		let chromosomeViewData: ChromosomeList = [{
			id: "Chr1",
			name: "Chr 1",
			size: 30427671,
			centromeres: [
				{
					id: "CEN1",
					start: 15086046,
					end: 15087045
				}
			]
		}];

		const species = "Arabidopsis_thaliana"
		const url = `https://bar.utoronto.ca/eplant/cgi-bin/chromosomeinfo.cgi?species=${species}`
		chromosomeViewData = await fetch(url).then(async (response) => {
			console.log(response)

			return response.json()
		}).then((responseObj: ChromosomesResponseObj) => responseObj["chromosomes"])

		return {
			viewData: chromosomeViewData,
			value: {
				scale: 0.8,
				translation: { x: 0, y: 0 }
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

				{/* <PanZoom
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
				> */}
				<MapInteractionCSS
					showControls
					defaultValue={{
						scale: 0.8,
						translation: { x: 100, y: 0 },
					}}
					value={state.value}
					onChange={(value: Transform) => {
						dispatch({
							type: 'set-transform',
							value,
						})
					}}
					minScale={0.25}
					maxScale={100}
					translationBounds={{
						xMax: 400,
						yMax: 0,
					}}
				>

					<ChromosomeView chromosomes={activeData} geneticElement={geneticElement} scale={state.value.scale}></ChromosomeView>
				</MapInteractionCSS>
				{/* </PanZoom> */}
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
					value: action.value,
				}
			case 'reset-transform':
				return {
					...state,
					value: {
						scale: 0.8,
						translation: { x: 100, y: 0 },
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