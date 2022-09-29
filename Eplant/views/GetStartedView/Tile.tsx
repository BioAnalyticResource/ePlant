import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Link,
  Typography,
} from '@mui/material'
import React from 'react'
import { usePanesDispatch, useViewID, useGeneticElements } from '@eplant/state'
import arabidopsis from '@eplant/Species/arabidopsis'
import { View } from '@eplant/View'

export type TileProps = {
  view: View
}

export default function Tile({
  view,
}: TileProps) {
  const id = useViewID()
  const panesDispatch = usePanesDispatch()
  const [genes, setGenes] = useGeneticElements()
  async function setView() {
    const ABI3 = await arabidopsis.api.searchGene('AT3G24650')
    if (ABI3) {
      setGenes([ABI3, ...genes])
    }
    panesDispatch({
      type: 'set-view',
      id: id,
      view: view.id,
    })
  }
  return (
    <Card>
      <CardContent>
        <div>
          <Typography variant="h5">{view.name}</Typography>
          <Typography variant="body2">{view.description}</Typography>
        </div>
      </CardContent>
      <CardMedia component="img" image={view.thumbnail} alt={view.name} />
      <CardActions>
        <Typography
          variant="caption"
          color={(theme) => theme.palette.secondary.main}
        >
          Example <Link href='#' onClick={setView}>AT3G24650 | ABI3</Link>
        </Typography>
      </CardActions>
    </Card>
  )
}
