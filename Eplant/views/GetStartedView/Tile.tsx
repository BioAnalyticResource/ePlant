import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material'
import React from 'react'

export type TileProps = {
  title: string
  description: string
  thumbnail: string
}

export default function Tile({ title, description, thumbnail }: TileProps) {
  return (
    <Card>
      <CardContent>
        <div>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2">{description}</Typography>
        </div>
      </CardContent>
      <CardMedia
        component="img"
        image={thumbnail}
        alt={title}
        width={258}
        height={146}
      />
      <CardActions></CardActions>
    </Card>
  )
}
