import { Box, Button } from '@mui/material'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid'
import * as React from 'react'
import { PublicationData } from './types'

const columns: GridColDef[] = [
  {
    field: 'author',
    headerName: 'Author',
    flex: 0.15,
    headerClassName: 'select-none',
  },
  {
    field: 'year',
    headerName: 'Year',
    flex: 0.15,
    headerClassName: 'select-none',
  },
  {
    field: 'journal',
    headerName: 'Journal',
    flex: 0.15,
    headerClassName: 'select-none',
  },
  {
    field: 'title',
    headerName: 'Title',
    flex: 0.5,
    headerClassName: 'select-none',
  },
  {
    field: 'link',
    headerName: 'Link',
    width: 130,
    headerClassName: 'select-none',
    renderCell: (params: GridRenderCellParams<string>) => (
      <Button href={params.value} variant="outlined" size="small">
        VIEW PAPER
      </Button>
    ),
  },
]

// Generate DataGrid rows from publication data
const toRows = (publications: PublicationData[]) => {
  const props: {
    id: string
    author: string
    year: number
    journal: string
    title: string
    link: string
  }[] = []
  publications.forEach((publication) => {
    props.push({
      id: publication.pubmed_id,
      author: publication.first_author,
      year: publication.year,
      journal: publication.journal,
      title: publication.title,
      link: `https://www.ncbi.nlm.nih.gov/pubmed/${publication.pubmed_id}`,
    })
  })
  return props
}

export const Publications = ({
  publications,
}: {
  publications: PublicationData[]
}) => {
  const [rows, setRows] = React.useState(toRows(publications))
  React.useEffect(() => {
    setRows(toRows(publications))
  }, [publications])

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
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        columns={columns}
        components={{ Toolbar: GridToolbar }}
        componentsProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
      />
    </Box>
  )
}
