// -------
// IMPORTS
// -------

import React, { FC, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { MapInteractionCSS } from "react-map-interaction";

import Typography from "@mui/material/Typography";

import { ChromosomeList } from "../types.js";

import Chromosome from "./Chromosome";
// TYPES
interface ChromosomeViewProps {
  chromosomes: ChromosomeList
}
//----------
// COMPONENT
//----------
const ChromosomeView: FC<ChromosomeViewProps> = ({ chromosomes }) => {
  return (
    <MapInteractionCSS
      showControls
      defaultValue={{
        scale: 1,
        translation: { x: 0, y: 0 },
      }}
      minScale={0.25}
      maxScale={100}
      translationBounds={{
        xMax: 0,
        yMax: 50,
      }}
    >
      <div
        style={{
          height: "100vh",
          width: "50%",
          display: "flex",
          flexDirection: "row",
          gap: "50%",
        }}
      >
        {chromosomes.map((chromosome, i) => {
          // Render a Chromosome component for each chromosome
          return (
            <div key={i}>
              <Typography noWrap>{chromosome.name}</Typography>
              <Chromosome chromosome={chromosome} />
              <Typography sx={{ fontSize: 8 }} noWrap>{(chromosome.size * 0.000001).toLocaleString()}Mb</Typography>

            </div>
          );
        })
        }
      </div>
    </MapInteractionCSS>
  );
};

export default ChromosomeView;
