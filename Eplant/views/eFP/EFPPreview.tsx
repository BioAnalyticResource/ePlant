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

const EFPPreviewContainer = styled(
  (props: BoxProps & { selected: boolean }) => <Box {...props} />
)(({ theme, selected }) => ({
  border: selected ? `2px solid ${theme.palette.secondary.main}` : ``,
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
    ...boxProps
  }: {
    gene: GeneticElement
    view: EFP
    selected: boolean
  } & BoxProps,
  ref
) {
  const { activeData, loading, loadingAmount, dispatch } = useViewData(
    view,
    gene
  )
  return (
    <EFPPreviewContainer ref={ref} selected={selected} {...boxProps}>
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
            dispatch={dispatch}
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
              MAX:{' '}
              {Math.round(Math.max(...activeData.groups.map((g) => g.max)))}
            </Typography>
          </div>
        </>
      )}
    </EFPPreviewContainer>
  )
})
