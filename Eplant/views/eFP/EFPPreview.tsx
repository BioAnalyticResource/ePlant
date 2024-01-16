import GeneticElement from '@eplant/GeneticElement'
import {
  Box,
  styled,
  BoxProps,
  Typography,
  Skeleton,
} from '@mui/material'
import {useMemo, useState, useEffect, useDeferredValue, startTransition} from 'react'
import EFP from '.'
import { EFPData } from './types'

const EFPPreviewContainer = styled(
  (props: BoxProps & { selected: boolean }) => <Box {...props} />
)(({ theme, selected }) => ({
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `2px solid ${theme.palette.background.active}`,
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: `${selected ? 1 : 3}px`,
  boxSizing: 'border-box',
  position: 'relative',
  flexDirection: 'column',
  overflow: 'hidden',
  justifyContent: 'center',
  display: 'flex',
}))

export type EFPPreviewProps = {
  gene: GeneticElement
  view: EFP
  selected: boolean
  colorMode: 'absolute' | 'relative'
  data: EFPData
} & BoxProps

export default function EFPPreview({
  gene,
  view,
  selected,
  colorMode,
  data,
  ...boxProps
}: EFPPreviewProps) {
  const colorModeDeferred = useDeferredValue(colorMode)
  const dataDeferred = useDeferredValue(data)
  const [draw, setDraw] = useState(false)
  useEffect(() => {
    if (!draw)
      startTransition(() => {
        setDraw(true)
      })
  }, [draw])
  const component = useMemo(() => {
    return (
      <EFPPreviewContainer selected={selected} {...boxProps}>
        <view.component
          activeData={{
            ...dataDeferred,
          }}
          state={{
            renderAsThumbnail: true,
            colorMode: colorModeDeferred,
          }}
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
          <Typography
            variant="caption"
            sx={{ marginLeft: '4px', fontWeight: 'light' }}
          >
            MAX: {Math.round(dataDeferred.max)}
          </Typography>
        </div>
      </EFPPreviewContainer>
    )
  }, [gene, view.id, colorModeDeferred, dataDeferred, selected])
  return draw ? (
    component
  ) : (
    <EFPPreviewContainer selected={selected} {...boxProps}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </EFPPreviewContainer>
  )
}
