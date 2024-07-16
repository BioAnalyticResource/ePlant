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
const GeneAnnotation: FC<GeneAnnotationProps> = ({ gene, scale }) => {
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const theme = useTheme()
  // Handlers
  const onClick = () => {
    setActiveGeneId(gene.id)
  }
  return (
    <g id={`${gene.id}_annotation`} cursor='pointer'>
      {/* GENE ID INDICATOR LINE */}
      <line
        x1={gene.strand == '+' ? 18 : 8}
        y1={
          scale >= 1.5
            ? gene.location + 1.5 / scale - 10 / scale
            : gene.location - 6
        }
        x2={
          gene.strand == '+' && scale <= 2
            ? 0
            : gene.strand == '-' && scale <= 2
              ? 25
              : gene.strand == '+'
                ? 8 - 20 / scale
                : 18 + 20 / scale
        }
        y2={
          scale >= 1.5
            ? gene.location + 1.5 / scale - 10 / scale
            : gene.location - 6
        }
        strokeWidth={scale <= 1 ? 1.5 : 1 / scale}
        stroke={theme.palette.secondary.contrastText}
      />
      {/* GENE ID INDICATOR TEXT */}
      <text
        fontSize={scale <= 0.75 ? 19 : scale <= 1.5 ? 15 : 20 / scale}
        letterSpacing='initial'
        textAnchor={gene.strand == '-' ? 'start' : 'end'}
        fill={
          gene.id == activeGeneId
            ? theme.palette.primary.main
            : theme.palette.secondary.contrastText
        }
        x={
          gene.strand == '+' && scale <= 2
            ? 0
            : gene.strand == '-' && scale <= 2
              ? 25
              : gene.strand == '+'
                ? 8 - 20 / scale
                : 18 + 20 / scale
        }
        y={gene.location}
      >
        <a onClick={onClick}>{gene.id}</a>
      </text>
      {/* GENE ID INDICATOR WHEN VERY ZOOMED IN */}
      {scale >= 75 && (
        <>
          <text
            letterSpacing='initial'
            x={12.5}
            y={gene.location - 3 / scale}
            fill={theme.palette.background.transparentOverlay}
            fontSize={15 / scale}
            stroke={theme.palette.background.transparentOverlay}
            strokeWidth={5 / scale}
          >
            ŒIIIIIIIIIIIIIID
          </text>
          <text
            letterSpacing='initial'
            x={12.5}
            y={gene.location - 3 / scale}
            fill={theme.palette.secondary.contrastText}
            fontSize={15 / scale}
          >
            {gene.id}
          </text>
        </>
      )}
    </g>
  )
}
export default GeneAnnotation
