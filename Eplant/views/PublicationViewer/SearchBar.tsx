import { GridToolbarQuickFilter } from '@mui/x-data-grid'
import * as React from 'react'

export const SearchBar = () => {
  return (
    <GridToolbarQuickFilter
      variant="outlined"
      size="small"
      placeholder=""
      label="Search"
      sx={{ width: '100%', mt: 3 }}
    />
  )
}
