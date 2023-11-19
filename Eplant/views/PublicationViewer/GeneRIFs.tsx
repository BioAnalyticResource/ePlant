import { Box, Button } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
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
      <>
        <a rel='noopener noreferrer' href={params.value} target="_blank" color="inherit"
          style={{ textDecoration: 'none' }}>
          <Button>
            VIEW PAPER
          </Button>
        </a>
      </>
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
  const [rows, setRows] = React.useState(toRows(geneRIFs))
  React.useEffect(() => {
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
