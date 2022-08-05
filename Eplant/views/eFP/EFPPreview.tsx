import GeneticElement from '@eplant/GeneticElement'
import { Box, LinearProgress } from '@mui/material'
import { BoxProps } from '@mui/system'
import * as React from 'react'
import EFP from '.'
import { useViewData } from '../View'

export default function EFPPreview({
  gene,
  view,
  selected,
  ...boxProps
}: {
  gene: GeneticElement
  view: EFP
  selected: boolean
} & BoxProps) {
  console.log(gene, view)
  const { activeData, loading, loadingAmount } = useViewData(view, gene)
  return (
    <Box
      {...boxProps}
      sx={{
        width: '108px',
        height: '75px',
        borderColor: 'divider',
        border: `${selected ? 2 : 1}px solid`,
        padding: `${selected ? 3 : 4}px`,
        boxSizing: 'border-box',
        position: 'relative',
        flexDirection: 'column',
        overflow: 'hidden',
        justifyContent: 'center',
        display: 'flex',
      }}
    >
      {loading || !activeData ? (
        <LinearProgress
          sx={{
            width: '100%',
          }}
          value={loadingAmount * 100}
          variant="determinate"
        />
      ) : (
        <>
          <view.component
            activeData={{ ...activeData, renderAsThumbnail: true }}
            geneticElement={gene}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
            }}
          >
            Max: {Math.round(Math.max(...activeData.groups.map((g) => g.max)))}
          </div>
        </>
      )}
    </Box>
  )
}
