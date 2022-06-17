import { useSpecies } from '@eplant/contexts/species'
import Species from '@eplant/Species'
import { Divider, FormControl, InputLabel, styled } from '@mui/material'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { SearchGroup } from './GeneSearch'
import { LogoWithText } from './Logo'

export function LeftNav(props: {}) {
  const species = useSpecies()
  return (
    <Stack gap={4} direction="column">
      <LogoWithText text="ePlant" />
      <SearchGroup addGeneticElement={() => {}}></SearchGroup>
      <Divider light />
    </Stack>
  )
}
