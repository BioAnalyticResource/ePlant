import GeneticElement from '@eplant/GeneticElement'
import Species from '@eplant/Species'
import { Button, MenuItem, styled, TextField } from '@mui/material'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import SearchBar from './SearchBar'

export const MenuButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.text.secondary,
}))

export function SearchGroup({
  species: speciesList,
  addGeneticElement,
}: {
  species: Species[]
  addGeneticElement: (gene: GeneticElement) => void
}) {
  const [species, setSpecies] = React.useState<Species>()
  const [searchingByExpression, setSearchingByExpression] =
    React.useState<boolean>(false)
  const [searchingByPhenotype, setSearchingByPhenotype] =
    React.useState<boolean>(false)
  return (
    <Stack direction="column" spacing={2}>
      <TextField
        select
        size="small"
        value={species?.name ?? ''}
        onChange={(e) =>
          setSpecies(speciesList.find((s) => s.name == e.target.value))
        }
        label="Species"
      >
        {speciesList.map((s, idx) => (
          <MenuItem key={s.name} value={s.name}>
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
        complete={species?.api?.autocomplete}
        onSubmit={(terms: string[]) => {
          if (!species) return
          for (const s of terms) {
            species.api
              .searchGene(s)
              .then((gene) => gene && addGeneticElement(gene))
          }
        }}
      ></SearchBar>
      <MenuButton variant="contained">Search by expression</MenuButton>
      <MenuButton variant="contained">Search by phenotype</MenuButton>
    </Stack>
  )
}
