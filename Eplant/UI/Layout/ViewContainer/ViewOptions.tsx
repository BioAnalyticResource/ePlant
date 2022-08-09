import GeneticElement from '@eplant/GeneticElement'
import { View, ViewProps, ViewDispatch } from '@eplant/View'
import { useViewData } from '@eplant/View/viewData'
import { MenuItem } from '@mui/material'
import React from 'react'
import Dropdown from '@eplant/UI/Dropdown'

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
  if (!view.actions) return <></>
  return (
    <Dropdown
      variant="text"
      color="secondary"
      sx={{
        color: 'secondary.contrastText',
      }}
      disabled={loading}
      options={view.actions.map((a, i) => (
        <MenuItem key={i} onClick={() => dispatch(a.action)}>
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
  )
}
