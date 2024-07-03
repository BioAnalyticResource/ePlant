// -------
// IMPORTS
// -------
import React, { FC, useState } from "react";
import Draggable from "react-draggable";

import GeneticElement from "@eplant/GeneticElement";
import arabidopsis from "@eplant/Species/arabidopsis";
import {
	useActiveGeneId,
	useCollections,
	useGeneticElements,
	useSetActiveGeneId,
	useSetCollections,
	useSetGeneticElements
} from "@eplant/state"
import CloseIcon from '@mui/icons-material/Close';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";

import { GeneIcon } from "../icons";
import { GeneArray, GeneItem } from "../types";

// TYPES
interface GeneListProps {
	id: string,
	start: number,
	end: number,
	anchorOrigin: Array<number>
}
// STYLES
const positioningStyles = {
	entering: 'translateX(0)',
	entered: 'translateX(0)',
	exiting: 'translateX(500px)',
	exited: 'translateX(500px)',
	unmounted: 'translateX(500px)',
};

//----------
// COMPONENT
//----------
const GeneList: FC<GeneListProps> = ({
	id,
	start,
	end,
	anchorOrigin
}) => {


	const [loading, setLoading] = useState<boolean>(true);
	// gene list
	const [geneList, setGeneList] = useState<GeneArray>([{
		id: "",
		start: 0,
		end: 0,
		strand: "",
		aliases: [],
		annotation: ""
	}]);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [selectedGene, setSelectedGene] = useState<GeneItem | null>(null)
	// gene info popup
	const [open, setOpen] = useState(false);

	// Other/Global State
	const geneticElements = useGeneticElements()
	const setGeneticElements = useSetGeneticElements()
	const setActiveGeneId = useSetActiveGeneId()
	const collections = useCollections()
	const setCollections = useSetCollections()
	const theme = useTheme()


	//------------------
	// Helper Functions
	//------------------
	React.useEffect(() => {
		const fetchGeneData = async () => {
			// Request return error, has something to do with CORS i think
			const response: Response = await fetch(
				`https://bar.utoronto.ca/eplant/cgi-bin/querygenesbyposition.cgi?chromosome=${id}&start=${start}&end=${end}`
			);
			// await sleep(1000)
			if (response.ok) {
				const geneListData: GeneArray = await response.json();
				setGeneList(geneListData);

			}

		};
		fetchGeneData();
		setLoading(false)
	}, []);
	// EVENT HANDLERS
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setOpen(true)
	}
	const handleGeneSelect = (gene: GeneItem, index: number) => (event: React.MouseEvent<HTMLElement>) => {
		setSelectedIndex(index)
		setSelectedGene(gene)
		console.log("Clicked Gene: ", gene)
	}
	const handleClose = () => {
		setOpen(false)
	}
	const handleLoadGeneClick = (event: React.MouseEvent<HTMLElement>) => {
		if (selectedGene != null) {
			const gene = new GeneticElement(
				selectedGene.id,
				selectedGene.annotation,
				arabidopsis,
				selectedGene.aliases
			)
			geneticElements[0].push(gene)
			setGeneticElements(geneticElements[0])
			setActiveGeneId(gene.id)
			console.log(collections[0])
			console.log("new geneticelements list: ", geneticElements[0], "new gene: ", gene)

		}
		// setSelectedGeneId(gene.id)
	}




	return (
		<>
			{/* GENE LIST */}
			{loading
				&& <p>something is loading</p>
				|| <List sx={{ padding: 0 }} onClick={handleClick}>
					{geneList.map((gene, i) => {
						return (
							<ListItem key={i} disablePadding sx={{
								height: 23
							}}
							>
								{/* GENE LIST ITEM (rendered as  button) */}

								<ListItemButton selected={i === selectedIndex}
									onClick={handleGeneSelect(gene, i)}
									// title={gene.aliases.length != 0 ? `Aliases: ${gene.aliases}` : gene.id}
									sx={{ borderRadius: 0, padding: 0 }} >
									<ListItemIcon sx={{
										minWidth: 0
									}}>
										<GeneIcon height={15} stroke={theme.palette.primary.main} />
									</ListItemIcon>
									<ListItemText sx={{
										'& .MuiListItemText-primary': {
											fontSize: "10px",
											textOverflow: "ellipsis",
											textWrap: "nowrap"
										}
									}}>
										<span className="GeneID">{gene.id}</span>
										<span style={{ color: theme.palette.secondary.main }}>{gene.aliases.length > 0 ? `/${gene.aliases[0]}` : ""}</span>
									</ListItemText >
								</ListItemButton>


							</ListItem>
						);
					})
					}
				</List >
			}
			{/* GENE INFO POPUP */}
			{open && (
				<Draggable>
					<Popover

						disableScrollLock={true}
						open={open}
						anchorReference="anchorPosition"
						anchorPosition={{
							left: anchorOrigin[0] + 220,
							top: anchorOrigin[1] - 100

						}}
						onClose={handleClose}

					>

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
								{selectedGene?.id}
								<IconButton
									aria-label="close"
									onClick={handleClose}
									sx={{
										position: 'absolute',
										right: 8,
										top: 8,
										color: theme.palette.grey[500],
									}}
								>
									<CloseIcon />
								</IconButton>
							</DialogTitle>
							<Typography gutterBottom>
								id: {selectedGene?.id}
							</Typography>
							<Typography>
								start: {selectedGene?.start}
							</Typography>
							<Typography>
								end: {selectedGene?.end}

							</Typography>
							<Typography>
								strand: {selectedGene?.strand}
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


					</Popover >
				</Draggable >
			)
			}

		</>

	);
};

export default GeneList;
