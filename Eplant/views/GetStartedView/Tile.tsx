import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material'
import React from 'react'
import { usePanesDispatch, useViewID, useGeneticElements } from '@eplant/state'
import arabidopsis from '@eplant/Species/arabidopsis'
import { View } from '@eplant/View'

export type TileProps = {
  view: View
}

export default function Tile({ view }: TileProps) {
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
    <Card
      sx={(theme) => ({
        background: theme.palette.background.paperOverlay,
        border: '1px solid',
        borderColor: theme.palette.background.selected,
        boxShadow: '0px 4px 8px rgb(0,0,0,0.25)',
        height: '100%',
        marginRight: 1,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <CardMedia
        component="img"
        image={view.thumbnail}
        alt={view.name}
        height={'100%'}
        sx={{ width: 'auto', margin: '1rem 1rem 0 1rem', border: '2px solid', borderColor: (theme) => theme.palette.background.edgeLight, borderRadius: (theme) => theme.shape.borderRadius+"px" }}
      />

      <CardContent>
        <div>
          <Typography variant="h6">{view.name}</Typography>
          <Typography
            variant="body2"
            color={(theme) => theme.palette.secondary.main}
          >
            {view.description}
          </Typography>
        </div>
      </CardContent>

      <CardActions>
        <Typography
          variant="caption"
          color={(theme) => theme.palette.secondary.main}
          sx={{ ml: 1 }}
        >
          Example{' '}
        </Typography>
        <Button onClick={setView} size="small">
          AT3G24650 | ABI3
        </Button>
      </CardActions>
    </Card>
  )
}
