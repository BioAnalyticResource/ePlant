// -------
// IMPORTS
// -------

import React, { FC, useEffect, useState } from "react";
import Draggable from "react-draggable";

import GeneticElement from "@eplant/GeneticElement";
import arabidopsis from "@eplant/Species/arabidopsis";
import { useActiveGeneId, useGeneticElements, useSetGeneticElements } from "@eplant/state";
import CloseIcon from '@mui/icons-material/Close';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import useTheme from "@mui/material/styles/useTheme";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { GeneItem } from "../types";


// TYPES
interface GeneInfoPopupProps {
	gene: GeneItem,
	open: boolean,
	anchorOrigin: number[]
}



//----------
// COMPONENT
//----------
const GeneInfoPopup: FC<GeneInfoPopupProps> = (props) => {
	const [open, setOpen] = useState(props.open);
	const [gene, setGene] = useState<GeneItem>(props.gene)
	// Global State
	const [activeGeneId, setActiveGeneId] = useActiveGeneId()
	const geneticElements = useGeneticElements()
	const setGeneticElements = useSetGeneticElements()
	const theme = useTheme()

	useEffect(() => {
		setOpen(props.open)
	}, [props])
	// EVENT HANDLERS
	const handleClose = () => {
		setOpen(false)
	}
	const handleLoadGeneClick = (event: React.MouseEvent<HTMLElement>) => {
		if (gene != null) {
			const geneticElement = new GeneticElement(
				gene.id,
				gene.annotation,
				arabidopsis,
				gene.aliases
			)
			geneticElements[0].push(geneticElement)
			setGeneticElements(geneticElements[0])
			setActiveGeneId(geneticElement.id)
		}
	}

	return (
		<>
			{open && (

				<Draggable>
					<Popover
						disableScrollLock={true}
						open={open}
						anchorReference="anchorPosition"
						anchorPosition={{
							left: props.anchorOrigin[0] + 220,
							top: props.anchorOrigin[1] - 100

						}}
						onClose={handleClose}

					>
						<Box
							sx={{
								minWidth: "300px",
								maxWidth: "400px",
								minHeight: "150px",
								maxHeight: "400px",
								padding: 2
							}}
						>
							<Table size="small">
								<TableHead>
									{gene.id}
									<IconButton
										title="Close Popup"
										aria-label="close"
										color="error"
										onClick={handleClose}
										sx={{
											position: 'absolute',
											right: 8,
											top: 8,
										}}
									>
										<CloseIcon />
									</IconButton>
								</TableHead>
								<TableBody sx={{
									'tr': { maxHeight: "20px" },
									'.label': { color: theme.palette.secondary.main }
								}}
								>
									<TableRow>
										<TableCell className="label">Identifier</TableCell>
										<TableCell>{gene.id}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="label">Aliases</TableCell>
										<TableCell>{gene.aliases.length > 0 ? gene.aliases : "N/A"}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="label">Strand</TableCell>
										<TableCell>{gene.strand}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="label">Annotation</TableCell>
										<TableCell>{gene.annotation != "" ? gene.annotation : "N/A"}</TableCell>
									</TableRow>
								</TableBody>
								<Button autoFocus title="Load gene into collection" variant="contained" size="small" color="success"
									onClick={handleLoadGeneClick} sx={{ marginTop: "10px" }}>
									Load Gene
								</Button>
							</Table>
						</Box>
					</Popover >
				</Draggable >
			)}
		</>
	)
}

export default GeneInfoPopup;