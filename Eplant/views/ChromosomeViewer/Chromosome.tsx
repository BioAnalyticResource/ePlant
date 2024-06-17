// -------
// IMPORTS
// -------
import React, { FC, useEffect } from "react";
//@ts-ignore
import OutsideClickHandler from "react-outside-click-handler";

import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";

import GeneticElementList from "./GeneticElementList";
import { CentromereList, ChromosomeItem } from "./types";
//----------
// TYPES
//----------
interface ChromosomeProps {
	chromosome: ChromosomeItem;
}
interface Range {
	start: number;
	end: number;
}
// COMPONENT
//----------
const Chromosome: FC<ChromosomeProps> = ({ chromosome }) => {
	// State
	const [anchorOrigin, setAnchorOrigin] = React.useState<Array<number>>([]);
	const [geneRange, setGeneRange] = React.useState<Range>({
		start: 0,
		end: 0,
	});
	// SVG drawing
	const centromeres: CentromereList = chromosome.centromeres;
	const hasCentromeres: boolean = centromeres.length > 0;
	const lastCentromereEnd: number = hasCentromeres
		? centromeres[centromeres.length - 1].end
		: 0;

	const x: number = 10;
	const y: number = 0;
	const width: number = 10;
	const perBpHeight: number = 0.000015;
	let start: number = 0;

	// Execute on first render
	useEffect(() => {
		const svg: HTMLElement & SVGSVGElement = getChromosomeSvg();
		// Get the bounds of the SVG content
		const bbox: SVGRect = svg.getBBox();
		// Update the width and height using the size of the contents
		svg.setAttribute("width", `${bbox.x + bbox.width + bbox.x}`);
		svg.setAttribute("height", `${bbox.y + bbox.height + bbox.y}`);
	}, []);

	//------------------
	// Helper Functions
	//------------------
	/**
	 * Gets the Chromosome svg element.
	 */
	const getChromosomeSvg = (): HTMLElement & SVGSVGElement => {
		const svg = document.getElementById(chromosome.id + "_svg") as HTMLElement &
			SVGSVGElement;
		return svg;
	};
	/**
	 * Gets the Chromosome top y-coordinate.
	 */
	const getChromosomeYCoordinate = (): number => {
		return getChromosomeSvg().getBoundingClientRect().top;
	};
	/**
	 * Gets the height of the Chromosome.
	 */
	const getChromosomeHeight = (): number => {
		return getChromosomeSvg().getBoundingClientRect().height;
	};
	/**
	 * Gets the number of base-pairs per pixel.
	 */
	const getBpPerPixel = (): number => {
		return chromosome.size / (getChromosomeHeight() - 1);
	};
	/**
	 * Converts a pixel value to the equivalent base-pair range.
	 *
	 * @param {Number} pixel A screen y-coordinate.
	 * @return {Number} Equivalent base-pair range.
	 */
	const pixelToBp = (pixel: number): Range => {
		if (
			pixel > getChromosomeYCoordinate() &&
			pixel < getChromosomeYCoordinate() + getChromosomeHeight()
		) {
			const range = {
				start: Math.floor(
					(pixel - 1 - getChromosomeYCoordinate()) * getBpPerPixel() + 1
				),
				end: Math.floor((pixel - getChromosomeYCoordinate()) * getBpPerPixel()),
			};
			if (range.end > chromosome.size) {
				range.end = chromosome.size;
			}
			return range;
		} else {
			return {
				start: 0,
				end: 0,
			};
		}
	};

	//--------------
	//Event Handling
	//--------------
	// Handle click on chromosome
	const handleClick = (event: MouseEvent) => {
		setAnchorOrigin([event.clientX, event.clientY]);
		setGeneRange(pixelToBp(event.clientY));
	};
	// Handle popup close
	const handleClose = () => {
		setAnchorOrigin([]);
	};

	// Popover prop variables
	const open: boolean = anchorOrigin.length === 0 ? false : true;
	const id = open ? "simple-popper" : undefined;

	return (
		<>
			{/* GENETIC ELEMENT LIST POPUP */}
			<Popover
				disableScrollLock={true}
				id={id}
				open={open}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={{
					left: anchorOrigin[0] + 10,
					top: anchorOrigin[1],
				}}
				sx={{}}
			>
				<OutsideClickHandler
					onOutsideClick={() => {
						handleClose();
					}}
				>
					{geneRange.start.toLocaleString()}
					<Box
						sx={{
							border: 1,
							borderRadius: 1,
							p: 1,
							background: "transparent",
							display: "flex",
							flexDirection: "column",
							maxHeight: "100px",
							minHeight: "10vh",
							overflowY: "scroll",
						}}
					>
						{open && (
							<GeneticElementList
								id={chromosome.id}
								start={geneRange.start}
								end={geneRange.end}
							/>
						)}
					</Box>
					{geneRange.end.toLocaleString()}
				</OutsideClickHandler>
			</Popover>
			{/* CHROMOSOME SVG */}
			<svg
				id={chromosome.id + "_svg"}
				width="0"
				height="0"
				viewBox="0 0 width height"
				preserveAspectRatio="xMidYMid meet"
				style={{ overflow: "visible", border: "0px blue solid" }}
			>
				<g>
					{/*Centromeric Layer  */}
					{hasCentromeres ? (
						<rect
							x={x}
							y={y}
							width={width * 0.6}
							height={chromosome.size * perBpHeight}
							ry={width / 2}
							fill="grey"
						/>
					) : (
						<rect
							x={x}
							y={y}
							width={width}
							height={chromosome.size * perBpHeight}
							ry={"50%"}
							fill="grey"
						/>
					)}
					{/* Non-Centromeric Layers */}
					{/* note: all except last can be drawn in a loop */}
					{hasCentromeres &&
						centromeres.map((centromere, index) => {
							start = index === 0 ? 0 : centromeres[index - 1].end;
							const end = centromere.start;
							return (
								<rect
									x={x - 2}
									y={y + start * perBpHeight}
									width={width}
									height={(end - start) * perBpHeight}
									ry={width / 2}
									fill="gray"
									key={index}
								/>
							);
						})}
					{/* Last Non-Centromeric Layer must be drawn seperately*/}
					{hasCentromeres && (
						<rect
							x={x - 2}
							y={y + lastCentromereEnd * perBpHeight}
							width={width}
							height={(chromosome.size - lastCentromereEnd) * perBpHeight}
							rx={width / 2}
							ry={width / 2}
							fill="gray"
						/>
					)}
					{/* Input Layer (transparent, must be drawn on top of other layers)*/}
					<rect
						x={x - 2}
						y={y}
						width={width}
						height={chromosome.size * perBpHeight}
						rx={width / 2}
						ry={width / 2}
						fill="transparent"
						//@ts-ignore
						onClick={handleClick}
					/>
				</g>
			</svg>
		</>
	);
};

export default Chromosome;
