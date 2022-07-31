import GeneticElement from '@eplant/GeneticElement'
import { useViewData, View } from '@eplant/views/View'
import { MenuItem } from '@mui/material'
import React from 'react'
import Dropdown from '@eplant/UI/Dropdown'

export default function ViewOptions<T, A>({
  view,
  gene,
}: {
  view: View<T, A>
  gene: GeneticElement | null
}) {
  const { activeData, loading, dispatch } = useViewData(view, gene)
  if (!view.actions) return <></>
  return (
    <Dropdown
      variant="outlined"
      color="secondary"
      disabled={loading}
      options={
        activeData
          ? view.actions.map((a, i) => (
              <MenuItem key={i} onClick={() => dispatch(a.action)}>
                <a.render activeData={activeData} geneticElement={gene} />
              </MenuItem>
            ))
          : []
      }
    >
      View options
    </Dropdown>
  )
}
