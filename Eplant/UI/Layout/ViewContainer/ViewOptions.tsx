import { useTransition } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import Dropdown from '@eplant/UI/Dropdown'
import { View, ViewDispatch } from '@eplant/View'
import { MenuItem } from '@mui/material'

export default function ViewOptions<T, S, A>({
  view,
  gene,
  loading,
  state,
  dispatch,
}: {
  view: View<T, S, A>
  gene: GeneticElement | null
  loading: boolean
  state?: S
  dispatch: ViewDispatch<A>
}) {
  const [transitioning, startTransition] = useTransition()
  if (!view.actions) return <></>
  return (
    <>
      <Dropdown
        variant='text'
        color='secondary'
        sx={{
          color: 'secondary.contrastText',
        }}
        disabled={loading || transitioning}
        options={view.actions.map((a, i) => (
          <MenuItem
            key={i}
            onClick={() => startTransition(() => dispatch(a.action))}
          >
            {state ? (
              <a.render
                dispatch={dispatch}
                state={state}
                geneticElement={gene}
              />
            ) : (
              '...'
            )}
          </MenuItem>
        ))}
      >
        View options
      </Dropdown>
    </>
  )
}
