import { Button } from '@mui/material'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { PublicationData } from './types'

const columns: GridColDef[] = [
  { field: 'author', headerName: 'Author', flex: 0.15 },
  { field: 'year', headerName: 'Year', flex: 0.15 },
  { field: 'journal', headerName: 'Journal', flex: 0.15 },
  { field: 'title', headerName: 'Title', flex: 0.5 },
  {
    field: 'link',
    headerName: 'Link',
    width: 130,
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
  const [rows, setRows] = useState(toRows(publications))
  useEffect(() => {
    setRows(toRows(publications))
  }, [publications])

  return (
    <>
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
    </>
  )
}
