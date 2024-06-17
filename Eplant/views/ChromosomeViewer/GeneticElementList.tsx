// -------
// IMPORTS
// -------
import React, { FC } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { GeneList } from "./types";
// TYPES
interface GeneticElementListProps {
	id: string;
	start: number;
	end: number;
}
//----------
// COMPONENT
//----------
const GeneticElementList: FC<GeneticElementListProps> = ({
	id,
	start,
	end,
}) => {
	const [geneList, setGeneList] = React.useState<GeneList>([{
		id: "",
		start: 0,
		end: 0,
		strand: "",
		aliases: [],
		annotation: ""
	}]);

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
				const geneListData: GeneList = await response.json();
				setGeneList(geneListData);
			}
		};
		fetchGeneData();
	}, []);
	return (
		<List>
			{geneList.map((gene, i) => {
				return (
					<ListItem key={i}>
						<ListItemText>{gene.id}</ListItemText>
					</ListItem>
				);
			})
			}
		</List>
	);
};

export default GeneticElementList;
