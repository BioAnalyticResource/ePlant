// -------
// IMPORTS
// -------
import React, { FC, useEffect, useState } from "react";

import useTheme from "@mui/material/styles/useTheme";

import { SimplifiedGeneItem } from "../types";

//----------
// TYPES
//----------
interface GeneIndicatorsProps {
	collection: SimplifiedGeneItem[],
	scale: number
}
//----------
// COMPONENT
//----------
const GeneIndicators: FC<GeneIndicatorsProps> = ({ collection, scale }) => {

	const theme = useTheme()
	useEffect(()=>{
		
	},[collection])

	return (
		<>
			{collection.map((gene, i) => {
				return (
					<g key={i} id={`${gene.id}_indicator`} cursor="pointer">
						<line
							x1={gene.strand == "+" ? 18 : 8}
							y1={scale >= 2 ? gene.location - 3 : gene.location - 5}
							x2={gene.strand == "+" ? 2 : 24}
							y2={scale >= 2 ? gene.location - 3 : gene.location - 5}
							strokeWidth={scale >= 2 ? 0.5 : scale <= 0.6 ? 3 : 2 / scale}
							stroke={theme.palette.secondary.contrastText} />
						<text fontSize={scale >= 2 ? 8 : 15}
							fill={theme.palette.secondary.contrastText}
							x={`${gene.strand == "+" && scale >= 2 ? -40 : gene.strand == "+" ? -78 : 25}`}
							y={`${gene.location}`}
						>
							{gene.id}
						</text>
					</g>)
			})
			}
		</>
	)
}
export default GeneIndicators