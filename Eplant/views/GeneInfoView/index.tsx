import { Container, Table, TableHead, TableRow } from '@mui/material'
import * as React from 'react'
import { z } from 'zod'
import { View, ViewProps } from '../View'
import MuiTableCell from '@mui/material/TableCell'
import { styled } from '@mui/material/styles'
import TableBody from '@mui/material/TableBody'

export const GeneInfoViewData = z.object({
  name: z.string(),
  brief_description: z.string(),
  computational_description: z.string(),
  curator_summary: z.string(),
  location: z.string(),
  chromosome_start: z.number(),
  chromosome_end: z.number(),
  strand: z.string(),
  geneSequence: z.string(),
  features: z
    .object({
      type: z.enum(['exon', 'CDS', 'five_prime_UTR', 'three_prime_UTR']),
      uniqueID: z.string(),
      start: z.number().int(),
      end: z.number().int(),
      strand: z.string(),
    })
    .array(),
})
export type GeneInfoViewData = z.infer<typeof GeneInfoViewData>

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  borderBottom: 'none',
  verticalAlign: 'top',
}))

const LabelCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'right',
  whiteSpace: 'nowrap',
}))

export const GeneInfoView = {
  name: 'Gene Info Viewer',
  dataType: GeneInfoViewData,
  component({ geneticElement, activeData: _data }: ViewProps) {
    // ePlant ensures that _data is actually of type GeneInfoViewData using zod
    const activeData: GeneInfoViewData = _data
    return (
      <div>
        <Table>
          <TableBody>
            <TableRow>
              <LabelCell>Gene:</LabelCell>
              <TableCell>{geneticElement.id}</TableCell>
            </TableRow>
            <TableRow>
              <LabelCell>Aliases:</LabelCell>
              <TableCell>{geneticElement.aliases.join(', ')}</TableCell>
            </TableRow>
            <TableRow>
              <LabelCell>Full Name:</LabelCell>
              <TableCell>{activeData.name}</TableCell>
            </TableRow>
            <TableRow>
              <LabelCell>Brief Description:</LabelCell>
              <TableCell>{activeData.brief_description}</TableCell>
            </TableRow>
            <TableRow>
              <LabelCell>Computational Description:</LabelCell>
              <TableCell>{activeData.computational_description}</TableCell>
            </TableRow>
            <TableRow>
              <LabelCell>Curator Summary:</LabelCell>
              <TableCell>{activeData.curator_summary}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  },
}
