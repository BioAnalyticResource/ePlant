/// YET TO IMPLEMENT

import React, { FC, useEffect, useState } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import arabidopsis from '@eplant/Species/arabidopsis'
import {
  useActiveGeneId,
  useGeneticElements,
  useSetGeneticElements,
} from '@eplant/state'
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import useTheme from '@mui/material/styles/useTheme'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import { GeneItem } from '../ChromosomeViewer/types'
interface GeneDialogProps {
  gene: GeneItem
}
const GeneDialog: FC<GeneDialogProps> = ({ gene }) => {
  // Global State
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const geneticElements = useGeneticElements()
  const setGeneticElements = useSetGeneticElements()
  const theme = useTheme()

  const handleLoadGeneClick = (event: React.MouseEvent<HTMLElement>) => {
    if (gene != null) {
      const geneticElement = new GeneticElement(
        gene.id,
        gene.annotation,
        arabidopsis,
        gene.aliases
      )

      setGeneticElements([...geneticElements[0], geneticElement])
      setActiveGeneId(gene.id)
    }
  }

  return (
    <div
      style={{
        minWidth: '350px',
        maxWidth: '350px',
        minHeight: '150px',
        maxHeight: '400px',
        paddingInline: 2,
        paddingBlockStart: 1,
        paddingBlockEnd: 2,
        border: '2px solid white',
      }}
    >
      {/* GENE INFO TABLE */}
      <table>
        <tr>
          <td className='label'>Identifier</td>
          <td>{gene.id}</td>
        </tr>
        <tr>
          <td className='label'>Aliases</td>
          <td>{gene.aliases.length > 0 ? gene.aliases : 'N/A'}</td>
        </tr>
        <tr>
          <td className='label'>Annotation</td>
          <td>{gene.annotation != '' ? gene.annotation : 'N/A'}</td>
        </tr>
      </table>
    </div>
  )
}

export default GeneDialog
