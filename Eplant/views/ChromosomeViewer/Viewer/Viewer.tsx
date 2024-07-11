// -------
// IMPORTS
// -------

import React, { FC, useEffect, useLayoutEffect, useState } from 'react'

import { useGeneticElements } from '@eplant/state'
import Typography from '@mui/material/Typography'

import { ChromosomeList, GeneAnnotationItem, GeneItem } from '../types'

import Chromosome from './Chromosome'
// TYPES
interface ChromosomeViewProps {
  chromosomes: ChromosomeList
  activeGeneAnnotation: GeneAnnotationItem | null
  geneAnnotationArray: GeneAnnotationItem[] | []
  scale: number
}
//----------
// COMPONENT
//----------
const Viewer: FC<ChromosomeViewProps> = ({
  chromosomes,
  activeGeneAnnotation,
  geneAnnotationArray,
  scale,
}) => {
  const filterGeneAnnotationArray = (chromosomeId: string) => {
    // filter the annotation genes by chromosome
    const filteredGenes: GeneAnnotationItem[] = []
    geneAnnotationArray.map((geneAnnotation) => {
      if (chromosomeId == geneAnnotation.chromosome) {
        filteredGenes.push(geneAnnotation)
      }
    })
    return filteredGenes
  }
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
              activeGeneAnnotation={
                activeGeneAnnotation?.chromosome == chromosome.id
                  ? activeGeneAnnotation
                  : null
              }
              geneAnnotationArray={filterGeneAnnotationArray(chromosome.id)}
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
