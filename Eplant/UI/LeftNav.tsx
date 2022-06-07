import Species from '@eplant/Species'
import {
  FormControl,
  InputLabel,
  MenuItem,
  styled,
  TextField,
} from '@mui/material'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import SearchBar from './GeneSearch/SearchBar'

const MenuButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.text.secondary,
}))

export function SearchGroup({ species: speciesList }: { species: Species[] }) {
  const [species, setSpecies] = React.useState<Species>()
  return (
    <Stack direction="column" spacing={2}>
      <TextField
        select
        size="small"
        value={species?.id ?? ''}
        onChange={(e) =>
          setSpecies(speciesList.find((s) => s.id == e.target.value))
        }
        label="Species"
      >
        {speciesList.map((s, idx) => (
          <MenuItem key={s.id} value={s.id}>
            {s.name}
          </MenuItem>
        ))}
      </TextField>
      <SearchBar
        label="Search by gene name"
        inputProps={{
          // TODO: Make these clickable
          helperText: <span>Example ABI3 or AT5G60200</span>,
        }}
      ></SearchBar>
      <MenuButton variant="contained">Search by expression</MenuButton>
      <MenuButton variant="contained">Search by phenotype</MenuButton>
    </Stack>
  )
}

export function LeftNav() {
  return <Stack></Stack>
}
