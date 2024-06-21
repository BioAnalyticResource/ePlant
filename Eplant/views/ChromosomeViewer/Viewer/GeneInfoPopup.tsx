import React, { FC, useEffect, useState } from "react";
import Draggable from "react-draggable";

import { useSetActiveGeneId } from "@eplant/state";
import CloseIcon from '@mui/icons-material/Close';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Popover from "@mui/material/Popover";
import Typography from '@mui/material/Typography';

import { GeneItem } from "../types";

interface InfoDialogProps {
	gene: GeneItem | null,
	open: boolean,
	location: number[]
}

const InfoDialog: FC<InfoDialogProps> = (props) => {
	const [gene, setGene] = useState<GeneItem>(props.gene)
	const [open, setOpen] = useState<boolean>(props.open)
	const setActiveGeneId = useSetActiveGeneId()


	useEffect(() => {
		setOpen(props.open)
		setGene(props.gene)
	}, [props])
	// EVENT HANDLERS
	const handleLoadGeneClick = (event: React.MouseEvent<HTMLElement>) => {
		console.log(gene.id)
		// setActiveGeneId(gene.id)
	}

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Draggable>
			<Popover

				disableScrollLock={true}
				open={open}
				anchorReference="anchorPosition"
				anchorPosition={{
					left: props.location[0],
					top: props.location[1] - 100

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


			</Popover >
		</Draggable>

	)
}

export default InfoDialog;