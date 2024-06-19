// -------
// IMPORTS
// -------
import React, { FC, useState } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { GeneArray } from "../types";

import InfoDialog from "./InfoDialog";
import Button from "@mui/material/Button";
import { Typography } from "@mui/material";
// TYPES
interface GeneListProps {
	id: string;
	start: number;
	end: number;
}
//----------
// COMPONENT
//----------
const GeneList: FC<GeneListProps> = ({
	id,
	start,
	end,
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
	const handleClick = () => {
		setOpen(true)
	}
	return (
		<List>
			{geneList.map((gene, i) => {
				return (
					<ListItem key={i} disablePadding>
						<Button onClick={handleClick} sx={{ fontSize: "10px", paddingBlock: 0 }} >
							<Typography>{gene.id}</Typography>
						</Button>
						{open && (
							<InfoDialog gene={gene} dialogOpen={open}></InfoDialog>
						)}

					</ListItem>
				);
			})
			}
		</List >

	);
};

export default GeneList;
