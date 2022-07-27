import { Add } from '@mui/icons-material'
import { Color, Stack, useTheme, Button } from '@mui/material'
import Box from '@mui/material/Box'
import * as React from 'react'

/**
 * Displayed when a tab is popped out
 * @param props.dock Docks the popout back into the layout
 * @param props.focus Brings the popout window into focus
 * @returns
 */
export default function PopoutPlaceholder(props: {
  dock: () => void
  focus: () => void
}) {
  return (
    <Stack gap={6} direction="column">
      <Button variant="outlined" color="primary" onClick={() => props.dock()}>
        Dock
      </Button>
      <Button variant="outlined" color="primary" onClick={() => props.focus()}>
        Focus
      </Button>
    </Stack>
  )
}
