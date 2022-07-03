import { GridToolbarQuickFilter } from '@mui/x-data-grid'

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
