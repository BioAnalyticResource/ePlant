import { useURLState } from '@eplant/state/URLStateProvider'
import { StateAction } from '@eplant/View'
import { Box, Button, Grid, Tooltip } from '@mui/material'

interface ActionsPanelProps<T> {
  actions?: StateAction<T>[]
}

export const ActionsPanel = <T,>({ actions }: ActionsPanelProps<T>) => {
  const { state, setState, initializeState } = useURLState<T>()
  const actionButtons = actions?.map((action) => {
    return (
      <Tooltip key={action.name} title={action.description}>
        <Button
          startIcon={action.icon}
          onClick={() => {
            if (state) setState(action.mutation(state))
          }}
        ></Button>
      </Tooltip>
    )
  })
  if (actionButtons === undefined) return <></>
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
