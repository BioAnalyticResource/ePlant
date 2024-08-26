// -------
// IMPORTS
// -------

import { FC } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { ChromosomeItem, GeneAnnotationItem } from '../types'

import Chromosome from './Chromosome'

// TYPES
interface ViewerProps {
  chromosomes: ChromosomeItem[]
  annotations: GeneAnnotationItem[]
  scale: number
}
//----------
// COMPONENT
//----------
const Viewer: FC<ViewerProps> = ({ chromosomes, annotations, scale }) => {
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
        const chromosomeAnnotations: GeneAnnotationItem[] = []
        annotations.map((gene, j) => {
          if (gene.chromosome === chromosome.id) {
            chromosomeAnnotations.push(gene)
          }
        })
        // Render a Chromosome component for each chromosome
        return (
          <Box key={i}>
            <Typography fontSize='30px' noWrap sx={{ marginLeft: '-20px' }}>
              {chromosome.name}
            </Typography>
            <Chromosome
              chromosome={chromosome}
              annotations={chromosomeAnnotations}
              scale={scale}
            />
            <Typography sx={{ fontSize: 8 }} noWrap>
              {(chromosome.size * 0.000001).toLocaleString()}Mb
            </Typography>
          </Box>
        )
      })}
    </div>
  )
}

export default Viewer
