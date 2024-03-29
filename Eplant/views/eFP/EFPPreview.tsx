import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'

import GeneticElement from '@eplant/GeneticElement'
import { Box, BoxProps, Skeleton, styled, Typography } from '@mui/material'

import { EFPData } from './types'
import EFP from '.'

const EFPPreviewContainer = styled(
  (props: BoxProps & { selected: boolean }) => <Box {...props} />
)(({ theme, selected }) => ({
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `2px solid ${theme.palette.background.edgeLight}`,
  background: theme.palette.background.paperOverlay,
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
  maskThreshold: number
  maskingEnabled: boolean
} & BoxProps

export default function EFPPreview({
  gene,
  view,
  selected,
  colorMode,
  data,
  maskThreshold,
  maskingEnabled,
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
            maskThreshold: maskThreshold,
            maskingEnabled: maskingEnabled,
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
          }}
        >
          <Typography
            variant='caption'
            sx={{ marginLeft: '4px', fontWeight: 'light' }}
          >
            Max: {Math.round(dataDeferred.max)}
          </Typography>
        </div>
      </EFPPreviewContainer>
    )
  }, [
    gene,
    view.id,
    colorModeDeferred,
    dataDeferred,
    selected,
    maskThreshold,
    maskingEnabled,
  ])
  return draw ? (
    component
  ) : (
    <EFPPreviewContainer selected={selected} {...boxProps}>
      <Skeleton variant='rectangular' width='100%' height='100%' />
    </EFPPreviewContainer>
  )
}
