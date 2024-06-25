// -------
// IMPORTS
// -------

import React, { FC, useEffect } from "react";

import GeneticElement from "@eplant/GeneticElement.js";
import Typography from "@mui/material/Typography";

import { ChromosomeList } from "../types.js";

import Chromosome from "./Chromosome.js";
// TYPES
interface ChromosomeViewProps {
  chromosomes: ChromosomeList,
  geneticElement: GeneticElement,
  scale: number
}
//----------
// COMPONENT
//----------
const Viewer: FC<ChromosomeViewProps> = ({ chromosomes, geneticElement, scale }) => {
  return (

    <div style={{
      height: "100vh",
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
            <Chromosome chromosome={chromosome} geneticElement={geneticElement} />
            <Typography sx={{ fontSize: 8 }} noWrap>{(chromosome.size * 0.000001).toLocaleString()}Mb</Typography>

          </div>
        );
      })
      }
    </div>
  );
};

export default Viewer;
