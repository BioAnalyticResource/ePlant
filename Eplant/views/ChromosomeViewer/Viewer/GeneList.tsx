// -------
// IMPORTS
// -------
import React, { FC, useState } from "react";
import Draggable from "react-draggable";

import { useSetActiveGeneId } from "@eplant/state";
import CloseIcon from '@mui/icons-material/Close';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

import { GeneArray, GeneItem } from "../types";

// TYPES
interface GeneListProps {
	id: string,
	start: number,
	end: number,
	anchorOrigin: Array<number>
}
//----------
// COMPONENT
//----------
const GeneList: FC<GeneListProps> = ({
	id,
	start,
	end,
	anchorOrigin
}) => {
	const [geneList, setGeneList] = useState<GeneArray>([{
		id: "",
		start: 0,
		end: 0,
		strand: "",
		aliases: [],
		annotation: ""
	}]);
	const [open, setOpen] = React.useState(false);
	const [activeGene, setActiveGene] = React.useState<GeneItem | null>(null)
	// const setGeneInfoPopup = useSetGeneInfoPopup()
	const setActiveGeneId = useSetActiveGeneId()


	//------------------
	// Helper Functions
	//------------------
	React.useEffect(() => {

		const fetchGeneData = async () => {
			// Request return error, has something to do with CORS i think
			const response: Response = await fetch(
				`https://bar.utoronto.ca/eplant/cgi-bin/querygenesbyposition.cgi?chromosome=${id}&start=${start}&end=${end}`
			);
			if (response.ok) {
				const geneListData: GeneArray = await response.json();
				setGeneList(geneListData);
			}
		};
		fetchGeneData();
	}, []);
	// EVENT HANDLERS
	const handleGeneListClick = (gene: GeneItem) => (event: React.MouseEvent<HTMLElement>) => {
		setOpen(true)
		setActiveGene(gene)
	}
	const handleLoadGeneClick = (event: React.MouseEvent<HTMLElement>) => {
		console.log(activeGene.id)
		// setActiveGeneId(gene.id)
	}
	const handleClose = () => {
		setOpen(false);
	};


	return (
		<List>
			{geneList.map((gene, i) => {
				return (
					<ListItem key={i} disablePadding>
						{/* GENE LIST ITEM (rendered as  button) */}
						<Button onClick={handleGeneListClick(gene)} sx={{ fontSize: "10px", borderRadius: 0, paddingBlock: 0 }} >
							<Typography>{gene.id}</Typography>
						</Button>
						{/* GENE INFO POPUP */}

						{open && (
							// <Draggable>
							<Popover

								disableScrollLock={true}
								open={open}

								onClose={handleClose}
								sx={{

									left: anchorOrigin[0],
									top: anchorOrigin[1] - 100
								}}
							>

								<ClickAwayListener onClickAway={handleClose}>

									<Box
										sx={{
											minWidth: "300px",
											maxWidth: "500px",
											minHeight: "150px",
											maxHeight: "400px",
											padding: 2
										}}
									>
										<DialogTitle>
											{gene.id}
											<IconButton
												aria-label="close"
												onClick={handleClose}
												sx={{
													position: 'absolute',
													right: 8,
													top: 8,
													color: (theme) => theme.palette.grey[500],
												}}
											>
												<CloseIcon />
											</IconButton>
										</DialogTitle>
										<Typography gutterBottom>
											id: {gene.id}
										</Typography>
										<Typography>
											start: {gene.start}
										</Typography>
										<Typography>
											end: {gene.end}

										</Typography>
										<Typography>
											strand: {gene.strand}
										</Typography>
										<Typography>
											{/* aliases: {gene.aliases} */}
										</Typography>
										<Button autoFocus variant="contained" color="success" >
											<div onClick={handleLoadGeneClick}>
												Load Gene
											</div>
										</Button>
									</Box>
								</ClickAwayListener>


							</Popover >
							// </Draggable>

						)}

					</ListItem>
				);
			})
			}
		</List >

	);
};

export default GeneList;
