// -------
// IMPORTS
// -------

import React, { FC } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { MapInteractionCSS } from "react-map-interaction";

import Typography from "@mui/material/Typography";

import Chromosome from "./Chromosome";
import { ChromosomeList } from "./types.js";
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
              <Typography>{chromosome.name}</Typography>
              <Chromosome chromosome={chromosome} />
            </div>
          );
        })
        }
      </div>
    </MapInteractionCSS>
  );
};

export default ChromosomeView;
