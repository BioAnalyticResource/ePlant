// -------
// IMPORTS
// -------
import React, { FC, useEffect, useState } from 'react'
import Draggable from 'react-draggable'

import GeneticElement from '@eplant/GeneticElement'
import arabidopsis from '@eplant/Species/arabidopsis'
import {
  useActiveGeneId,
  useGeneticElements,
  useSetGeneticElements,
} from '@eplant/state'
import CloseIcon from '@mui/icons-material/Close'
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import useTheme from '@mui/material/styles/useTheme'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import { GeneItem } from '../types'

// TYPES
interface GeneInfoPopupProps {
  gene: GeneItem
  open: boolean
  anchorOrigin: number[]
}

//----------
// COMPONENT
//----------
const GeneInfoPopup: FC<GeneInfoPopupProps> = (props) => {
  const [open, setOpen] = useState(props.open)
  const [gene, setGene] = useState<GeneItem>(props.gene)
  // Global State
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const geneticElements = useGeneticElements()
  const setGeneticElements = useSetGeneticElements()
  const theme = useTheme()

  useEffect(() => {
    if (props.gene != gene) {
      setOpen(props.open)
      setGene(props.gene)
    }
  }, [props])
  // --------------
  // EVENT HANDLERS
  // --------------
  const handleClose = () => {
    setOpen(false)
  }
  const handleLoadGeneClick = (event: React.MouseEvent<HTMLElement>) => {
    if (gene != null) {
      const geneticElement = new GeneticElement(
        gene.id,
        gene.annotation,
        arabidopsis,
        gene.aliases
      )
      setGeneticElements([...geneticElements[0], geneticElement])
      setActiveGeneId(geneticElement.id)
    }
  }

  return (
    <Draggable>
      <Popover
        disableScrollLock={true}
        open={open}
        anchorReference='anchorPosition'
        anchorPosition={{
          left: props.anchorOrigin[0] + 220,
          top: props.anchorOrigin[1] - 100,
        }}
        onClose={handleClose}
      >
        <Box
          sx={{
            minWidth: '350px',
            maxWidth: '350px',
            minHeight: '150px',
            maxHeight: '400px',
            paddingInline: 2,
            paddingBlockStart: 1,
            paddingBlockEnd: 2,
          }}
        >
          {/* POPUP TITLE BAR */}
          <div style={{ display: 'flex' }}>
            <IconButton
              title='Close Popup'
              aria-label='close'
              size='small'
              color='secondary'
              onClick={handleClose}
              sx={{
                marginRight: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant='h6'>Gene Info</Typography>
          </div>
          {/* GENE INFO TABLE */}
          <Table size='small'>
            <TableBody
              sx={{
                tr: { maxHeight: '20px' },
                '.label': { color: theme.palette.secondary.main },
              }}
            >
              <TableRow>
                <TableCell className='label'>Identifier</TableCell>
                <TableCell>{gene.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='label'>Aliases</TableCell>
                <TableCell>
                  {gene.aliases.length > 0 ? gene.aliases : 'N/A'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='label'>Strand</TableCell>
                <TableCell>{gene.strand}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='label'>Annotation</TableCell>
                <TableCell>
                  {gene.annotation != '' ? gene.annotation : 'N/A'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {/* LOAD GENE BUTTON */}
          <Button
            autoFocus
            title='Load gene into collection'
            variant='contained'
            size='small'
            color='success'
            onClick={handleLoadGeneClick}
            sx={{ marginTop: '10px' }}
          >
            Load Gene
          </Button>
        </Box>
      </Popover>
    </Draggable>
  )
}

export default GeneInfoPopup
