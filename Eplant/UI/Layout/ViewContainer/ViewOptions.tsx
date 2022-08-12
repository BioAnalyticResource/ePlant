import GeneticElement from '@eplant/GeneticElement'
import { View, ViewProps, ViewDispatch } from '@eplant/View'
import { useViewData } from '@eplant/View/viewData'
import { CircularProgress, MenuItem } from '@mui/material'
import React from 'react'
import Dropdown from '@eplant/UI/Dropdown'
import delayed from '@eplant/util/delayed'

export default function ViewOptions<T, A>({
  view,
  gene,
  loading,
  activeData,
  dispatch,
}: {
  view: View<T, A>
  gene: GeneticElement | null
  loading: boolean
  activeData?: T
  dispatch: ViewDispatch<A>
}) {
  const [transitioning, startTransition] = React.useTransition()
  if (!view.actions) return <></>
  return (
    <>
      <Dropdown
        variant="text"
        color="secondary"
        sx={{
          color: 'secondary.contrastText',
        }}
        disabled={loading || transitioning}
        options={view.actions.map((a, i) => (
          <MenuItem
            key={i}
            onClick={() => startTransition(() => dispatch(a.action))}
          >
            {activeData ? (
              <a.render
                dispatch={dispatch}
                activeData={activeData}
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
