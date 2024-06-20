import React, { FC, useEffect, useState } from "react";

import { useSetActiveGeneId } from "@eplant/state";
import CloseIcon from '@mui/icons-material/Close';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Popover from "@mui/material/Popover";
import Typography from '@mui/material/Typography';

import { GeneItem } from "../types";

interface InfoDialogProps {
	gene: GeneItem,
	dialogOpen: boolean
}

const InfoDialog: FC<InfoDialogProps> = ({ gene, dialogOpen }) => {
	const [open, setOpen] = useState<boolean>(dialogOpen)
	const setActiveGeneId = useSetActiveGeneId()


	useEffect(() => {
	}, [])
	const loadGene = () => {
		console.log(gene.id)
		// setActiveGeneId(gene.id)
	}
	const handleClose = () => {
		setOpen(false);
	};



	return (
		<Popover

			disableScrollLock={true}
			open={open}

			onClose={handleClose}
			sx={{
				left: "50%",
				top: "50%"
			}}
		>
			{/* <Dialog
			open={open}
			onClose={handleClose}
			sx={{
				"& .MuiDialog-container": {
					background: "transparent"
				}
			}}
		> */}
			<ClickAwayListener onClickAway={handleClose}>

				<Box
					sx={{
						width: "500px",
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
						<div onClick={loadGene}>
							Load Gene
						</div>
					</Button>
				</Box>
			</ClickAwayListener>


		</Popover >
	)
}

export default InfoDialog;