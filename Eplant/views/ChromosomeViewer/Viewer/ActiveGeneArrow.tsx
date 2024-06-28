import React, { FC, useEffect, useState } from "react";

import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup';
import ArrowLeft from "@mui/icons-material/ArrowLeft";
import Typography from '@mui/material/Typography';


interface ActiveGeneArrowProps {
	title: string,
	x: number,
	y: number,
	open: boolean,
}

const InfoDialog: FC<ActiveGeneArrowProps> = (props) => {



	return (
		<Popup
			container={document.getElementById("activeGeneArrowWrapper")}
			open={props.open}
			anchor={{
				getBoundingClientRect: () => {
					return new DOMRect(
						props.x,
						props.y,
						0,
						0,
					);
				},
			}
			}
		>
			<div style={{ display: "flex", flexDirection: "row" }}><ArrowLeft sx={{ fontSize: 10 }} /> <Typography sx={{ fontSize: 6 }}>{props.title}</Typography></div>
		</Popup>
	)
}

export default InfoDialog;