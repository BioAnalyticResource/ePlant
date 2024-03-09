import React from 'react'
import { useParams } from 'react-router-dom'

import arabidopsis from '@eplant/Species/arabidopsis'
import {
  useGeneticElements,
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
  const {geneId, viewId} = useParams();
  const [genes, setGenes] = useGeneticElements()

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
        <Button
          component={Link}
          to={`/${view.id}/AT3G24650`}
          size='small'
        >
          AT3G24650 | ABI3
        </Button>
      </CardActions>
    </Card>
  )
}
