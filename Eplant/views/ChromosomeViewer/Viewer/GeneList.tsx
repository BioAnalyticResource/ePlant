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
	useSetCollections,
	useSetGeneticElements,
} from "@eplant/state"
import CloseIcon from '@mui/icons-material/Close';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import useTheme from "@mui/material/styles/useTheme";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { GeneIcon } from "../icons";
import { GeneArray, GeneItem } from "../types";

import GeneInfoPopup from "./GeneInfoPopup";

// TYPES
interface GeneListProps {
	id: string,
	start: number,
	end: number,
	anchorOrigin: number[]
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
	const [activeGeneId, setActiveGeneId] = useActiveGeneId()
	const geneticElements = useGeneticElements()
	const setGeneticElements = useSetGeneticElements()
	const collections = useCollections()
	const setCollections = useSetCollections()
	const theme = useTheme()



	//------------------
	// Helper Functions
	//------------------
	React.useEffect(() => {
		const fetchGeneData = async () => {
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
	}, []);
	// EVENT HANDLERS
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setOpen(true)
	}
	const handleGeneSelect = (gene: GeneItem, index: number) => (event: React.MouseEvent<HTMLElement>) => {
		setSelectedIndex(index)
		setSelectedGene(gene)
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
		}
	}




	return (
		<>
			{/* GENE LIST */}
			<List sx={{ padding: 0 }} onClick={handleClick}>
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

			{/* GENE INFO POPUP */}
			{selectedGene != null && (
				<>
					<GeneInfoPopup gene={selectedGene} open={open} anchorOrigin={anchorOrigin} ></GeneInfoPopup>
					<GeneInfoPopup gene={selectedGene} open={open} anchorOrigin={anchorOrigin} ></GeneInfoPopup>
				</>
			)}

		</>

	);
};

export default GeneList;
