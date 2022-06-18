import { useSpecies } from '@eplant/contexts/species'
import Species from '@eplant/Species'
import { Divider, FormControl, InputLabel, styled } from '@mui/material'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { SearchGroup } from './GeneSearch'
import { LogoWithText } from '../Logo'
import { useGeneticElements } from '@eplant/contexts/geneticElements'
import GeneticElementComponent from '../GeneticElementComponent'

export function LeftNav(props: {}) {
  const [species, setSpecies] = useSpecies()
  const [geneticElements, setGeneticElements] = useGeneticElements()
  return (
    <Stack gap={4} direction="column">
      <LogoWithText text="ePlant" />
      <SearchGroup addGeneticElement={() => {}}></SearchGroup>
      <Divider light />
      <Stack gap={1} direction="column">
        {geneticElements.map((g) => (
          <GeneticElementComponent
            geneticElement={g}
            selected={false}
            key={g.id}
            onClickMenu={() => {}}
          ></GeneticElementComponent>
        ))}
      </Stack>
    </Stack>
  )
}
