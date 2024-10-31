import { Box, Button, Grid, Tooltip } from '@mui/material'

import { StateActions } from '.'

interface ActionsPanelProps<T> {
  actions: StateActions<T>
  prevState: T
  setState: (newState: T) => void
}

export const ActionsPanel = <T,>({
  actions,
  prevState,
  setState,
}: ActionsPanelProps<T>) => {
  const actionButtons = Object.entries(actions)
    .filter(([_, action]) => action.rendered)
    .map(([key, action]) => {
      if (action.rendered) {
        return (
          <Tooltip key={key} title={key}>
            <Button
              startIcon={action.icon}
              onClick={() => setState(action.mutation(prevState))}
            ></Button>
          </Tooltip>
        )
      }
      return null // Should never get here but need this to make TS compiler happy
    })

  const rows = []
  for (let i = 0; i < actionButtons.length; i += 5) {
    rows.push(actionButtons.slice(i, i + 5))
  }

  return (
    <Box>
      {rows.map((row, index) => (
        <Grid container spacing={2} key={index}>
          {row.map((button) => (
            <Grid item key={button?.key}>
              {button}
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  )
}
