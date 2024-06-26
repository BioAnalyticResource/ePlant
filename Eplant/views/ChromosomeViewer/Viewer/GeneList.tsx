// -------
// IMPORTS
// -------
import React, { FC, useState } from "react";

import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import Button from "@mui/material/Button";
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
import SnackbarContent from "@mui/material/SnackbarContent";
import { Transition } from "react-transition-group";
import Popper from "@mui/material/Popper";

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

	const [geneList, setGeneList] = useState<GeneArray>([{
		id: "",
		start: 0,
		end: 0,
		strand: "",
		aliases: [],
		annotation: ""
	}]);
	const [loading, setLoading] = useState<boolean>(true);
	// gene list
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [activeGene, setActiveGene] = useState<GeneItem | null>(null)
	// gene info popup
	const [open, setOpen] = useState(false);
	// snackbar
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [exited, setExited] = useState(true);
	const nodeRef = React.useRef(null);
	const snackbarVirtualEl = {
		getBoundingClientRect: () => {
			return {
				bottom: 1,
				right: 1,
				width: 0,
				height: 0,

			}
		}
	}
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
		console.log(loading)
		fetchGeneData();
		setLoading(false)
	}, []);
	// EVENT HANDLERS
	const handleGeneListClick = (gene: GeneItem, index: number) => (event: React.MouseEvent<HTMLElement>) => {
		if (index === selectedIndex) {
			setOpen(true)
			setSnackbarOpen(false)
		} else {
			setSnackbarOpen(true)
			setOpen(false)
		}
		setActiveGene(gene)
		setSelectedIndex(index)
		console.log("Clicked Gene: ", gene, open)
	}
	const handleSnackbarClick = () => {
		setSnackbarOpen(true)
	}
	const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setSnackbarOpen(false);
	};


	const handleOnEnter = () => {
		setExited(false);
	};

	const handleOnExited = () => {
		setExited(true);
	};


	const snackbarAction = (
		<React.Fragment>
			<Button color="success" size="small" onClick={handleSnackbarClose}>
				Load Gene
			</Button>
			<IconButton
				size="small"
				aria-label="close"
				color="inherit"
				onClick={handleSnackbarClose}
			>
				<CloseIcon fontSize="small" />
			</IconButton>
		</React.Fragment>
	);





	return (
		<>
			{loading
				&& <p>something is loading</p>
				|| <List sx={{ padding: 0 }}>
					{geneList.map((gene, i) => {
						return (
							<ListItem key={i} disablePadding sx={{
								height: 23
							}} secondaryAction={
								<IconButton edge="end" aria-label="load-gene" title="Load Gene">
									<LaunchIcon sx={{ fontSize: 8 }} />
								</IconButton>
							}
							>
								{/* GENE LIST ITEM (rendered as  button) */}

								<ListItemButton selected={selectedIndex === i}
									onClick={handleGeneListClick(gene, i)}
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
									}}>{gene.id}<span style={{ color: theme.palette.secondary.main }}>{gene.aliases.length > 0 ? `/${gene.aliases[0]}` : ""}</span>
									</ListItemText >
								</ListItemButton>
								{/* GENE INFO POPUP */}


							</ListItem>
						);
					})
					}
				</List >
			}
			{open && (
				<GeneInfoPopup gene={activeGene} open={open} location={anchorOrigin} />
			)
			}
			<Popper
				open={snackbarOpen}
				placement="bottom"
				onClose={handleSnackbarClose}
				message={`Gene selected. Click gene again to open gene info`}
				sx={{
					zIndex: 5500,
					display: "flex",
					height: "100px",
					"& .MuiSnackbarContent-root": {
						background: theme.palette.background.paperOverlay,
						color: theme.palette.text.primary
					}
				}}
			>

				<SnackbarContent
					message="Gene selected. Click gene again to view info."
					action={snackbarAction}
				/>

			</Popper >

		</>

	);
};

export default GeneList;
