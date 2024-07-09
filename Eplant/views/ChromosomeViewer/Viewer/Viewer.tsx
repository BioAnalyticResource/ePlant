// -------
// IMPORTS
// -------

import React, { FC, useEffect, useLayoutEffect, useState } from "react";

import { useGeneticElements } from "@eplant/state";
import Typography from "@mui/material/Typography";

import { ChromosomeList, GeneItem, SimplifiedGeneItem } from "../types";

import Chromosome from "./Chromosome";
// TYPES
interface ChromosomeViewProps {
  chromosomes: ChromosomeList,
  activeGene: GeneItem | null,
  simplifiedGenes: SimplifiedGeneItem[] | [],
  scale: number
}
//----------
// COMPONENT
//----------
const Viewer: FC<ChromosomeViewProps> = ({ chromosomes, activeGene, simplifiedGenes, scale }) => {
  const filterSimplifiedGenes = (chromosomeId: string) => {
    // filter the simplified genes by chromosome
    const filteredGenes: SimplifiedGeneItem[] = [];
    (simplifiedGenes.map((simplifiedGene) => {
      if (chromosomeId == simplifiedGene.chromosome) {
        filteredGenes.push(simplifiedGene)
      }
    }))
    return filteredGenes
  }
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
            <Chromosome scale={scale} chromosome={chromosome} activeGene={activeGene?.chromosome == chromosome.id ? activeGene : null} simplifiedGenes={filterSimplifiedGenes(chromosome.id)} />
            <Typography sx={{ fontSize: 8 }} noWrap>{(chromosome.size * 0.000001).toLocaleString()}Mb</Typography>

          </div>
        );
      })
      }
    </div>
  );
};

export default Viewer;
