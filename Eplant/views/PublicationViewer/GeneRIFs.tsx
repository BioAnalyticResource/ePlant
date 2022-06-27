import { Button } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { GeneRIFsData } from './types'

const columns: GridColDef[] = [
  {
    field: 'annotation',
    headerName: 'Annotation',
    flex: 1,
  },
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
