// -------
// IMPORTS
// -------
import React, { createContext, FC, useContext, useState } from "react";

import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from "@mui/material/ListItemText";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";

import { GeneIcon } from "../icons";
import { GeneArray, GeneItem } from "../types";

import GeneInfoPopup from "./GeneInfoPopup";

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
	const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

	const [open, setOpen] = React.useState(false);
	const [activeGene, setActiveGene] = React.useState<GeneItem | null>(null)

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
			if (response.ok) {
				const geneListData: GeneArray = await response.json();
				setGeneList(geneListData);
			}
		};
		fetchGeneData();
	}, []);
	// EVENT HANDLERS
	const handleGeneListClick = (gene: GeneItem, index: number) => (event: React.MouseEvent<HTMLElement>) => {
		setOpen(true)
		setActiveGene(gene)
		setSelectedIndex(index)
		console.log("Clicked Gene: ", gene)
	}



	return (
		<>
			<List sx={{ padding: 0 }}>
				{geneList.map((gene, i) => {
					return (
						<ListItem key={i} disablePadding secondaryAction={
							<IconButton edge="end" aria-label="load-gene" title="Load Gene">
								<LaunchIcon sx={{ fontSize: 10 }} />
							</IconButton>
						}
						>
							{/* GENE LIST ITEM (rendered as  button) */}

							<ListItemButton selected={selectedIndex === i}
								onClick={handleGeneListClick(gene, i)}
								// title={gene.aliases.length != 0 ? `Aliases: ${gene.aliases}` : gene.id}
								sx={{ fontSize: "10px", borderRadius: 0, padding: 0.5 }} >
								<ListItemIcon sx={{
									minWidth: 0
								}}>
									<GeneIcon stroke={theme.palette.primary.main} />
								</ListItemIcon>
								<ListItemText>{gene.id}</ListItemText>
							</ListItemButton>
							{/* GENE INFO POPUP */}


						</ListItem>
					);
				})
				}
			</List >
			{open && (
				<GeneInfoPopup gene={activeGene} open={open} location={anchorOrigin} />
			)
			}

		</>

	);
};

export default GeneList;
