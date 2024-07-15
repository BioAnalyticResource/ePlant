// -------
// IMPORTS
// -------
import React, { FC } from 'react'

import { useActiveGeneId } from '@eplant/state'
import useTheme from '@mui/material/styles/useTheme'

import { GeneAnnotationItem } from '../types'

//----------
// TYPES
//----------
interface GeneAnnotationProps {
  gene: GeneAnnotationItem
  scale: number
}
//----------
// COMPONENT
//----------
const GeneAnnotation: FC<GeneAnnotationProps> = ({
  gene,
  scale,
}) => {
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const theme = useTheme()
  // Handlers
  const onClick = () => {
    setActiveGeneId(gene.id)
  }
  return (
    <g id={`${gene.id}_annotation`} cursor='pointer'>
      <line
        x1={gene.strand == '+' ? 18 : 8}
        y1={
          scale >= 1.5
            ? gene.location + 1.5 / scale - 10 / scale
            : gene.location - 6
        }
        x2={gene.strand == '+' ? 2 : 25}
        y2={
          scale >= 1.5
            ? gene.location + 1.5 / scale - 10 / scale
            : gene.location - 6
        }
        strokeWidth={scale <= 0.6 ? 3 : 2 / scale}
        stroke={theme.palette.secondary.contrastText}
      />
      <text
        fontSize={scale <= 1.5 ? 15 : 20 / scale}
        letterSpacing='initial'
        fill={
          gene.id == activeGeneId
            ? theme.palette.primary.main
            : theme.palette.secondary.contrastText
        }
        x={`${
          gene.strand == '+' && scale <= 1.5
            ? -76
            : gene.strand == '+' && scale >= 100
              ? -100 / scale + 1.99
              : gene.strand == '+' && scale >= 10
                ? -100 / scale + 1.91
                : gene.strand == '+' && scale >= 4
                  ? -100 / scale + 1.4
                  : gene.strand == '+'
                    ? -99 / scale
                    : 25
        }`}
        y={`${gene.location}`}
      >
        <a onClick={onClick}>{gene.id}</a>
      </text>
    </g>
  )
}
export default GeneAnnotation
