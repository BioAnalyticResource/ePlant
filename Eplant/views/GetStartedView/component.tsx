import { Grid, Link, Stack, Typography, useTheme } from '@mui/material'
import { Filter1, Filter2, Filter3 } from '@mui/icons-material'
import { ViewProps } from '../View'
import React from 'react'
import views from './views'
import Tile from './Tile'

export default function GetStartedView({
  geneticElement,
}: ViewProps<Record<string, never>>) {
  const theme = useTheme()
  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h2">ePlant 3</Typography>
        <Typography variant="h4" color={theme.palette.secondary.main}>
          Bioinformatics evolved
        </Typography>
      </div>
      <Stack spacing={1}>
        <Typography variant="h5">Start</Typography>
        <Stack direction="row" spacing={1}>
          <Filter1 color="primary" />
          <Typography color={theme.palette.primary.main}>
            Select a species
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Filter2 color="primary" />
          <Typography color={theme.palette.primary.main}>
            Enter a gene of interest
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Filter3 color="primary" />
          <Typography color={theme.palette.primary.main}>
            Use the view selector to navigate between views
          </Typography>
        </Stack>
      </Stack>
      <Stack>
        <Typography variant="body2" color={theme.palette.secondary.main}>
          Built by students in the{' '}
          <Link href="https://bar.utoronto.ca/" target="_blank">
            Provart Lab
          </Link>{' '}
          at the University of Toronto. If you&apos;re interested in
          contributing to the project, visit our{' '}
          <Link
            href="https://github.com/BioAnalyticResource/ePlant"
            target="_blank"
          >
            GitHub
          </Link>{' '}
          page and reach out to us{' '}
          <Link
            href="https://github.com/BioAnalyticResource/ePlant/issues"
            target="_blank"
          >
            here
          </Link>
          .
        </Typography>
      </Stack>
      <Grid container spacing={2} columns={4}>
        {views.map((view) => (
          <Grid item key={view.title}>
            <Tile {...view} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
