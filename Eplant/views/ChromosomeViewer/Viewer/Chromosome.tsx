// -------
// IMPORTS
// -------
import React, { FC, useEffect, useState } from "react";

import { useCollections } from "@eplant/state";
import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup';
import ArrowLeft from "@mui/icons-material/ArrowLeft";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import useTheme from "@mui/material/styles/useTheme";
import Typography from '@mui/material/Typography';

import { CentromereList, ChromosomeItem, GeneItem } from "../types";

import GeneInfoPopup from "./GeneInfoPopup";
import GeneList from "./GeneList";
//----------
// TYPES
//----------
interface ChromosomeProps {
	scale: number,
	chromosome: ChromosomeItem,
	activeGene: GeneItem | null
}

interface Range {
	start: number,
	end: number
}
interface SimplifiedGeneItem {
	id: string,
	location: number,
	strand: string
}
// COMPONENT
//----------
const Chromosome: FC<ChromosomeProps> = ({ scale, chromosome, activeGene }) => {
	// State
	const [geneInfoOpen, setGeneInfoOpen] = useState(false)
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [anchorOrigin, setAnchorOrigin] = useState<number[]>([]);
	const [anchorEl, setAnchorEl] = useState<null | any>(null);
	const [geneRange, setGeneRange] = useState<Range>({
		start: 0,
		end: 0,
	});
	const [simplifiedCollection, setSimplifiedCollection] = useState<SimplifiedGeneItem[]>([])
	const [activeGeneYCoordinate, setActiveGeneYCoordinate] = useState<number | null>(null)
	const [collections, setCollections] = useCollections()
	const [tempGene, setTempGene] = useState<GeneItem | null>(null)

	const theme = useTheme()

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
	useEffect(() => {
		const allGenesInCollections: string[] = [];
		if (collections.length != 0) {
			(collections.map((collection) => {
				if (collection.genes.length != 0) {
					allGenesInCollections.push(...collection.genes)
				}
			}));
			(allGenesInCollections.map((geneId) => {
				const fetchGene = async () => {
					const json: GeneItem = await fetch(
						`https://bar.utoronto.ca/eplant/cgi-bin/querygene.cgi?species=Arabidopsis_thaliana&term=${geneId}`
					).then((response) => response.json())
					setTempGene(json)
				}
				fetchGene()
				if (tempGene != null) {
					if (tempGene.chromosome == chromosome.id) {
						const genePixelLoc: number = (tempGene.start + tempGene.end) / 2 * perBpHeight
						const strand = tempGene.strand
						const simplifiedGene: SimplifiedGeneItem = { id: tempGene.id, location: genePixelLoc, strand: tempGene.strand }
						const newSimplifiedCollection = [...simplifiedCollection, simplifiedGene]
						setSimplifiedCollection(newSimplifiedCollection)
					}
				}
			}))
		}

		if ((activeGene != null) && (chromosome.id == activeGene.chromosome)) {
			let genePixelLoc: number = (activeGene.start + activeGene.end) / 2 * perBpHeight

			if (genePixelLoc < 4) {
				genePixelLoc = 4
			}
			// else if (genePixelLoc > parseFloat(getChromosomeSvg().getAttribute("height")) - 2) {
			// 	genePixelLoc = getChromosomeSvg().getAttribute("height") - 2
			// }

			setActiveGeneYCoordinate(genePixelLoc)

			// console.log("genePixelLoc: ", activeGeneYCoordinate)
		}
	}, [activeGene])

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
	* Gets the Chromosome right x-coordinate.
	*/
	const getChromosomeXCoordinate = (): number => {
		return getChromosomeSvg().getBoundingClientRect().right;
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
	 * Gets the number of pixels per base-pair.
	 *
	 * @return {Number} Number of pixels per base-pair.
	 */
	const getPixelsPerBp = () => {
		return 1 / getBpPerPixel();
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
	/**
	 * Converts a base-pair value to the equivalent pixel value.
	 *
	 * @param {Number} bp A base-pair value.
	 * @return {Number} Equivalent screen y-coordinate.
	 */
	const bpToPixel = (bp: number) => {
		return (bp - 1) * getPixelsPerBp() + 1;
	};

	//--------------
	//Event Handling
	//--------------
	// Handle click on chromosome
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		// define virtual element to attach geneList popup to
		const virtualEl = {
			getBoundingClientRect() {
				return {
					left: getChromosomeXCoordinate() + 100, // distanceX from the right of the chromosome (TODO: determine what side of the screen click is on and accordingly place popup on left or right of chromosome)
					top: event.clientY - 60, // distanceY from click(has weird functionality- need to fix)

					width: 0,
					height: 0,

				}
			}
		}
		setAnchorEl(anchorEl ? null : virtualEl);
		setAnchorOrigin([event.clientX, event.clientY]);
		setGeneRange(pixelToBp(event.clientY));
	};
	// Handle popup close
	const handleClose = () => {
		setAnchorOrigin([]);
		setAnchorEl(null);
	};
	// Handle mouse over
	const handleMouseOver = () => {
		setIsHovered(true)
	}
	// Handle mouse leave
	const handleMouseLeave = () => {
		setIsHovered(false)
	}
	// Handle active gene click
	const handleActiveGeneClick = () => {
		setGeneInfoOpen(!geneInfoOpen)
	}

	// Popover prop variables
	const open: boolean = anchorOrigin.length === 0 ? false : true;
	const openPopup = Boolean(anchorEl);

	return (
		<>


			{/* GENETIC ELEMENT LIST POPUP */}
			<Popup open={openPopup} anchor={anchorEl} style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center"
			}}>
				<ArrowLeft fontSize="medium" htmlColor={theme.palette.primary.main} sx={{
					position: "relative"
				}} />
				<div>
					<Typography variant="caption" sx={{ fontSize: 9 }}>
						{geneRange.start.toLocaleString()}
					</Typography>


					<ClickAwayListener
						onClickAway={handleClose}
					>
						<Box sx={{
							background: theme.palette.background.paper,
							border: `1.5px solid ${theme.palette.primary.dark}`,
							p: 0,
							width: "180px",
							maxHeight: "100px",
							minHeight: 30,
							overflowY: "scroll",
							overflowX: "clip"
						}}>
							{open && (
								<GeneList
									id={chromosome.id}
									start={geneRange.start}
									end={geneRange.end}
									anchorOrigin={anchorOrigin}
								/>
							)}
						</Box>
					</ClickAwayListener>
					<Typography variant="caption" sx={{ fontSize: 9 }}>
						{geneRange.end.toLocaleString()}
					</Typography>
				</div>

			</Popup>

			{/* =============== */}
			{/* CHROMOSOME SVG */}
			<svg
				id={chromosome.id + "_svg"}
				width="0"
				height={chromosome.size * perBpHeight}
				viewBox="0 0 width height"
				preserveAspectRatio="xMidYMid meet"
				style={{ overflow: "visible", border: "0px blue solid" }
				}
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
									ry={(end - start) * perBpHeight < 4 ? 2 : (end - start) * perBpHeight < 10 ? 3 : width / 2}
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
						id={chromosome.id + "_input"}
						x={x - 2}
						y={y}
						width={width}
						height={chromosome.size * perBpHeight}
						rx={width / 2}
						ry={width / 2}
						fill="transparent"
						onMouseEnter={handleMouseOver}
						onMouseLeave={handleMouseLeave}
						cursor={isHovered ? "pointer" : "default"}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-expect-error
						onClick={handleClick}
					/>

				</g>
				{/* GENES IN COLLECTION INDICATORS */}
				{/* <g id={`${chromosome.id}_genesInCollection`}>
					{simplifiedCollection.map((gene, i) => {
						return (
							<g key={i} id={`${gene.id}_indicator`} cursor="pointer">
								<line
									x1={gene.strand == "+" ? 18 : 8}
									y1={scale >= 2 ? gene.location - 3 : gene.location - 5}
									x2={gene.strand == "+" ? 2 : 24}
									y2={scale >= 2 ? gene.location - 3 : gene.location - 5}
									strokeWidth={scale >= 2 ? 0.5 : scale <= 0.6 ? 3 : 2 / scale}
									stroke={theme.palette.secondary.contrastText} />
								<text fontSize={scale >= 2 ? 8 : 15}
									fill={theme.palette.secondary.contrastText}
									x={`${gene.strand == "+" && scale >= 2 ? -40 : gene.strand == "+" ? -78 : 25}`}
									y={`${gene.location}`}
								>
									{gene.id}
								</text>
							</g>)
					})}
				</g> */}

				{/* ACTIVE GENE INDICATOR */}
		{activeGeneYCoordinate != null && activeGene != null && (
					<g id="activeGeneText" cursor="pointer">
						<line
							x1={activeGene.strand == "+" ? 18 : 8}
							y1={scale >= 2 ? activeGeneYCoordinate - 3 : activeGeneYCoordinate - 5}
							x2={activeGene.strand == "+" ? 2 : 24}
							y2={scale >= 2 ? activeGeneYCoordinate - 3 : activeGeneYCoordinate - 5}
							strokeWidth={scale >= 2 ? 0.5 : scale <= 0.6 ? 3 : 2 / scale}
							stroke={theme.palette.secondary.contrastText} />
						<a onClick={handleActiveGeneClick}>
							<text fontSize={scale >= 2 ? 8 : 15}
								fill={theme.palette.primary.main}
								x={`${activeGene.strand == "+" && scale >= 2 ? -40 : activeGene.strand == "+" ? -78 : 25}`}
								y={`${activeGeneYCoordinate}`}
							>
								{activeGene?.id}
							</text>
						</a>
					</g>
				)}
			</svg>
		</>
	);
};

export default Chromosome;
