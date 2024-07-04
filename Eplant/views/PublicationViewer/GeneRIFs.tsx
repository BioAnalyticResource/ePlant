import { useEffect, useState } from 'react'

import { Box, Button } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import { SearchBar } from './SearchBar'
import { GeneRIFsData } from './types'

const columns: GridColDef[] = [
  {
    field: 'annotation',
    headerName: 'Annotation',
    flex: 1,
    headerClassName: 'select-none',
  },
  {
    field: 'link',
    headerName: 'Link',
    width: 130,
    headerClassName: 'select-none',
    renderCell: (params: GridRenderCellParams<{ [key: string]: unknown }>) => (
      <Button
        href={params.value}
        variant='outlined'
        color='secondary'
        size='small'
        target='_blank'
      >
        VIEW PAPER
      </Button>
    ),
  },
]

// Generate DataGrid rows from gene RIF data
const toRows = (geneRIFs: GeneRIFsData[]) => {
  const props: {
    id: string
    annotation: string
    link: string
  }[] = []
  geneRIFs.forEach((geneRIF) => {
    props.push({
      id: geneRIF.publication.pubmed_id,
      annotation: geneRIF.annotation,
      link: `https://www.ncbi.nlm.nih.gov/pubmed/${geneRIF.publication.pubmed_id}`,
    })
  })
  return props
}

export const GeneRIFs = ({ geneRIFs }: { geneRIFs: GeneRIFsData[] }) => {
  const [rows, setRows] = useState(toRows(geneRIFs))
  useEffect(() => {
    setRows(toRows(geneRIFs))
  }, [geneRIFs])
  return (
    <Box
      sx={{
        '& .select-none': {
          userSelect: 'none',
        },
      }}
    >
      <DataGrid
        rows={rows}
        autoHeight
        columns={columns}
        sx={{ border: 0 }}
        components={{ Toolbar: SearchBar }}
      />
    </Box>
  )
}
