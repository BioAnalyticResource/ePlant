import React from 'react'

import arabidopsis from '@eplant/Species/arabidopsis'
import {
  useGeneticElements,
  useSetActiveGeneId,
  useSetActiveViewId,
} from '@eplant/state'
import { View } from '@eplant/View'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material'

export type TileProps = {
  view: View
}

export default function Tile({ view }: TileProps) {
  const setActiveViewId = useSetActiveViewId()
  const setActiveGeneId = useSetActiveGeneId()
  const [genes, setGenes] = useGeneticElements()

  // TODO: The gene to load should be a prop
  async function setView() {
    const ABI3 = await arabidopsis.api.searchGene('AT3G24650')
    console.log(ABI3)
    if (ABI3) {
      setGenes([ABI3, ...genes])
      setActiveGeneId(ABI3.id)
    }
    else {
      console.error("Failed to load gene for tile")
    }
    setActiveViewId(view.id)
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
        component='img'
        image={view.thumbnail}
        alt={view.name}
        height={'100%'}
        sx={{
          width: 'auto',
          margin: '1rem 1rem 0 1rem',
          border: '2px solid',
          borderColor: (theme) => theme.palette.background.edgeLight,
          borderRadius: (theme) => theme.shape.borderRadius + 'px',
        }}
      />

      <CardContent>
        <div>
          <Typography variant='h6'>{view.name}</Typography>
          <Typography
            variant='body2'
            color={(theme) => theme.palette.secondary.main}
          >
            {view.description}
          </Typography>
        </div>
      </CardContent>

      <CardActions>
        <Typography
          variant='caption'
          color={(theme) => theme.palette.secondary.main}
          sx={{ ml: 1 }}
        >
          Example{' '}
        </Typography>
        <Button onClick={setView} size='small'>
          AT3G24650 | ABI3
        </Button>
      </CardActions>
    </Card>
  )
}
