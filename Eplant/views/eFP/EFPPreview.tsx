import GeneticElement from '@eplant/GeneticElement'
import {
  Box,
  LinearProgress,
  styled,
  BoxProps,
  Typography,
} from '@mui/material'
import * as React from 'react'
import EFP from '.'
import { useViewData } from '../View'
import { EFPData } from './types'

const EFPPreviewContainer = styled(
  (props: BoxProps & { selected: boolean }) => <Box {...props} />
)(({ theme, selected }) => ({
  border: selected ? `2px solid ${theme.palette.primary.main}` : ``,
  background: theme.palette.background.active,
  borderRadius: theme.shape.borderRadius,
  padding: `${selected ? 1 : 3}px`,
  boxSizing: 'border-box',
  position: 'relative',
  flexDirection: 'column',
  overflow: 'hidden',
  justifyContent: 'center',
  display: 'flex',
}))
export default React.forwardRef(function EFPPreview(
  {
    gene,
    view,
    selected,
    colorMode,
    data,
    ...boxProps
  }: {
    gene: GeneticElement
    view: EFP
    selected: boolean
    colorMode: 'absolute' | 'relative'
    data: EFPData
  } & BoxProps,
  ref
) {
  return (
    <EFPPreviewContainer ref={ref} selected={selected} {...boxProps}>
      <view.component
        activeData={{ ...data, colorMode, renderAsThumbnail: true }}
        geneticElement={gene}
        dispatch={() => {}}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="caption">
          MAX: {Math.round(Math.max(...data.groups.map((g) => g.max)))}
        </Typography>
      </div>
    </EFPPreviewContainer>
  )
})
