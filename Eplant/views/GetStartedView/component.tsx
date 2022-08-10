import { Stack, Typography, useTheme } from '@mui/material'
import { Filter1, Filter2, Filter3 } from '@mui/icons-material'
import { ViewProps } from '../View'
import React from 'react'

export default function GetStartedView({
  geneticElement,
}: ViewProps<Record<string, never>>) {
  const theme = useTheme()
  return (
    <Stack spacing={2}>
      <Typography variant="h2">ePlant 3</Typography>
      <Typography variant="h4" color={theme.palette.secondary.main}>
        Bioinformatics evolved
      </Typography>
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
    </Stack>
  )
}
