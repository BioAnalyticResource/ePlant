// -------
// IMPORTS
// -------

import { FC } from 'react'

import Typography from '@mui/material/Typography'

import { ChromosomeItem } from '../types'

import Chromosome from './Chromosome'

// TYPES
interface ViewerProps {
  chromosomes: ChromosomeItem[]
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
