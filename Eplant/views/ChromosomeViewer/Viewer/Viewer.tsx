// -------
// IMPORTS
// -------

import React, { FC, useEffect } from "react";

import Typography from "@mui/material/Typography";

import { ChromosomeList, GeneItem } from "../types.js";

import Chromosome from "./Chromosome.js";
// TYPES
interface ChromosomeViewProps {
  chromosomes: ChromosomeList,
  activeGene: GeneItem | null,
  scale: number
}
//----------
// COMPONENT
//----------
const Viewer: FC<ChromosomeViewProps> = ({ chromosomes, activeGene, scale }) => {
  return (

    <div style={{
      height: "0px",
      display: "flex",
      flexDirection: "row",
      gap: chromosomes.length * 10,
    }}
    >
      {chromosomes.map((chromosome, i) => {
        // Render a Chromosome component for each chromosome
        return (
          <div key={i}>
            <Typography noWrap>{chromosome.name}</Typography>
            <Chromosome scale={scale} chromosome={chromosome} activeGene={activeGene?.chromosome == chromosome.id ? activeGene : null} />
            <Typography sx={{ fontSize: 8 }} noWrap>{(chromosome.size * 0.000001).toLocaleString()}Mb</Typography>

          </div>
        );
      })
      }
    </div>
  );
};

export default Viewer;
