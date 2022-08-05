import GeneticElement from '@eplant/GeneticElement'
import { Box, LinearProgress } from '@mui/material'
import * as React from 'react'
import EFP from '.'
import { useViewData } from '../View'

export default function EFPPreview({
  gene,
  view,
  selected,
}: {
  gene: GeneticElement
  view: EFP
  selected: boolean
}) {
  console.log(gene, view)
  const { activeData, loading, loadingAmount } = useViewData(view, gene)
  return (
    <Box
      sx={{
        width: '108px',
        height: '75px',
        borderColor: 'divider',
        border: `${selected ? 2 : 1}px solid`,
        padding: `${selected ? 3 : 4}px`,
        boxSizing: 'border-box',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      {loading || !activeData ? (
        <LinearProgress
          sx={{
            width: '100%',
          }}
          value={loadingAmount * 100}
          variant="query"
        />
      ) : (
        <view.component
          activeData={{ ...activeData, renderAsThumbnail: true }}
          geneticElement={gene}
        />
      )}
    </Box>
  )
}
