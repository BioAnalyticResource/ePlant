import React from 'react'

import { useConfig } from '@eplant/config'
import { ViewProps } from '@eplant/View'
import { Filter1, Filter2, Filter3 } from '@mui/icons-material'
import { Grid, Link, Stack, Typography, useTheme } from '@mui/material'

import Tile from './Tile'

export default function GetStartedView({
  geneticElement,
}: ViewProps<Record<string, undefined>, undefined, undefined>) {
  const theme = useTheme()
  const { views } = useConfig()
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant='h2'>ePlant 3</Typography>
        <Typography variant='h4' color={theme.palette.secondary.main}>
          Bioinformatics evolved
        </Typography>
      </div>
      <Stack spacing={1}>
        <Typography variant='h5'>Start</Typography>
        <Stack direction='row' spacing={2}>
          <Filter1 color='primary' />
          <Typography>Select a species</Typography>
        </Stack>
        <Stack direction='row' spacing={2}>
          <Filter2 color='primary' />
          <Typography>Enter a gene of interest</Typography>
        </Stack>
        <Stack direction='row' spacing={2}>
          <Filter3 color='primary' />
          <Typography>
            Use the view selector to navigate between views
          </Typography>
        </Stack>
      </Stack>
      <Stack>
        <Typography
          sx={{ width: '100%', maxWidth: 860 }}
          variant='body2'
          color={theme.palette.secondary.main}
        >
          Built by students in the{' '}
          <Link href='https://bar.utoronto.ca/' target='_blank'>
            Provart Lab
          </Link>{' '}
          at the University of Toronto. If you&apos;re interested in
          contributing to the project, visit our{' '}
          <Link
            href='https://github.com/BioAnalyticResource/ePlant'
            target='_blank'
          >
            GitHub
          </Link>{' '}
          page and reach out to us{' '}
          <Link
            href='https://github.com/BioAnalyticResource/ePlant/issues'
            target='_blank'
          >
            here
          </Link>
          .
        </Typography>
      </Stack>
      <Grid container spacing={1} columns={3}>
        {views.map((view) => {
          if (view.description && view.thumbnail) {
            return (
              <Grid item key={view.id} xs={1}>
                <Tile view={view} />
              </Grid>
            )
          }
        })}
      </Grid>
    </Stack>
  )
}
