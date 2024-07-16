// -------
// IMPORTS
// -------

import React, { FC, useEffect, useLayoutEffect, useState } from 'react'

import { useActiveGeneId, useGeneticElements } from '@eplant/state'
import Typography from '@mui/material/Typography'

import { ChromosomeList, GeneAnnotationItem, GeneItem } from '../types'

import Chromosome from './Chromosome'

// TYPES
interface ViewerProps {
  chromosomes: ChromosomeList
  scale: number
}
//----------
// COMPONENT
//----------
const Viewer: FC<ViewerProps> = ({ chromosomes, scale }) => {
  return (
    <div
      style={{
        height: '0px',
        display: 'flex',
        flexDirection: 'row',
        gap:
          chromosomes.length > 10
            ? chromosomes.length
            : chromosomes.length * 10,
      }}
    >
      {chromosomes.map((chromosome, i) => {
        // Render a Chromosome component for each chromosome
        return (
          <div key={i}>
            <Typography fontSize='30px' noWrap sx={{ marginLeft: '-20px' }}>
              {chromosome.name}
            </Typography>
            <Chromosome
              scale={scale}
              chromosome={chromosome}
            />
            <Typography sx={{ fontSize: 8 }} noWrap>
              {(chromosome.size * 0.000001).toLocaleString()}Mb
            </Typography>
          </div>
        )
      })}
    </div>
  )
}

export default Viewer
