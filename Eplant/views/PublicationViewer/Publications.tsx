import { useEffect, useState } from 'react'

import { Box, Button } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import { SearchBar } from './SearchBar'
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
    renderCell: (params: GridRenderCellParams<{ [key: string]: unknown }>) => (
      <>
        <Button
          href={params.value}
          variant='outlined'
          color='secondary'
          size='small'
          target='_blank'
        >
          VIEW PAPER
        </Button>
      </>
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
  const [rows, setRows] = useState(toRows(publications))
  useEffect(() => {
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
        columns={columns}
        sx={{ border: 0 }}
        components={{ Toolbar: SearchBar }}
      />
    </Box>
  )
}
