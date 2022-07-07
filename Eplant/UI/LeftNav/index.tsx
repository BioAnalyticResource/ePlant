import { useSpecies } from '@eplant/state'
import Species from '@eplant/Species'
import { Divider, FormControl, InputLabel, styled } from '@mui/material'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { SearchGroup } from './GeneSearch'
import { LogoWithText } from '../Logo'
import { useGeneticElements } from '@eplant/state'
import GeneticElementComponent from '../GeneticElementComponent'
import { Collections } from './Collections'
import GeneticElement from '@eplant/GeneticElement'
import _ from 'lodash'

/**
 * The left nav bar in ePlant. Contains a search bar, and list of collections of genes.
 * @param props.onSelectGene A function that is called when a new gene is selected
 * @param props.selectedGene The currently selected gene
 * @returns
 */
export function LeftNav(props: {
  onSelectGene?: (gene: GeneticElement) => void
  selectedGene?: string
}) {
  const [species, setSpecies] = useSpecies()
  const [geneticElements, setGeneticElements] = useGeneticElements()
  return (
    <Stack gap={4} direction="column">
      <LogoWithText text="ePlant" />
      <SearchGroup
        addGeneticElements={(s) => {
          setGeneticElements(
            geneticElements.concat(
              _.uniqWith(
                s.filter(
                  (g) => !geneticElements.find((gene) => g.id == gene.id)
                ),
                (a, b) => a.id == b.id
              )
            )
          )
        }}
      />
      <Divider light />
      <Collections
        onSelectGene={props.onSelectGene}
        selectedGene={props.selectedGene}
      />
    </Stack>
  )
}
