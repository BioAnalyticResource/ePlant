import { useEffect, useRef, useState } from 'react'

import { Stack, Tooltip, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { GeneFeature } from './types'

type GeneModelProps = {
  feature: GeneFeature & { subfeatures: GeneFeature[] }
  margin: number
}
export const GeneModel = ({ feature, margin }: GeneModelProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const [{ width, height }, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const updateDimensions = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.clientWidth,
          height: ref.current.clientHeight,
        })
      }
    }
    const resizeObserver = new window.ResizeObserver(updateDimensions)
    if (ref.current) resizeObserver.observe(ref.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [ref.current])

  const skipExons = !!feature.subfeatures.find((f: GeneFeature) =>
    f.type.endsWith('UTR')
  )

  // Different arrows depending on strand type
  const rightArrow = (
    <polyline
      points={`${width - margin},${height / 2} ${width - margin - 10},${
        height / 2 + 5
      } ${width - margin - 10},${height / 2 - 5}`}
      fill={theme.palette.grey[500]}
      stroke='none'
    ></polyline>
  )

  const leftArrow = (
    <polyline
      points={`${margin},${height / 2} ${margin + 10},${height / 2 + 5} ${
        margin + 10
      },${height / 2 - 5}`}
      fill={theme.palette.grey[500]}
      stroke='none'
    ></polyline>
  )
  return (
    <Stack direction={'row'} spacing={3} alignItems='center'>
      <Typography variant={'body1'}>{feature.uniqueID}</Typography>
      <div ref={ref} style={{ padding: 0, margin: 0, width: '100%' }}>
        <svg
          style={{
            width: '100%',
            margin: 0,
            height: '60px',
          }}
        >
          <rect
            x={margin + 2}
            // Subtract 1 because the rectangle has height 2
            y={height / 2 - 1}
            // Subtract a bit from width because there are arrows at the end
            width={Math.max(width - 2 * margin - 4, 0)}
            stroke='none'
            height={2}
            fill={theme.palette.grey[500]}
          ></rect>
          {feature.strand == '+' || feature.strand == '1'
            ? rightArrow
            : leftArrow}
          {feature.subfeatures
            .filter(
              (sf: GeneFeature) =>
                sf.type != 'mRNA' && (sf.type != 'exon' || !skipExons)
            )
            .map((sf: GeneFeature) => {
              const drawWidth = 0.9 * (width - 2 * margin),
                drawOffset = 0.05 * (width - 2 * margin)
              const length = Math.abs(feature.end - feature.start)
              const x = ((sf.start - feature.start) / length) * drawWidth
              const w = Math.max(
                (Math.abs(sf.end - sf.start) / length) * drawWidth,
                0
              )

              let h = 4,
                color = theme.palette.grey[600]
              if (sf.type.endsWith('UTR')) {
                h = 12
                color = theme.palette.grey[300]
              } else if (sf.type == 'CDS') {
                h = 20
              } else if (sf.type == 'exon') {
                h = 20
                color = theme.palette.grey[300]
              }

              return (
                <Tooltip
                  key={sf.uniqueID}
                  title={
                    <Stack direction='column' spacing={1}>
                      <Typography variant='subtitle1'>{sf.type}</Typography>
                      <div>Start: {sf.start}</div>
                      <div>End: {sf.end}</div>
                      <div>Strand: {sf.strand}</div>
                    </Stack>
                  }
                  arrow
                >
                  <rect
                    x={x + margin + drawOffset}
                    width={w}
                    y={height / 2 - h / 2}
                    height={h}
                    fill={color}
                    stroke='none'
                  ></rect>
                </Tooltip>
              )
            })}
        </svg>
      </div>
    </Stack>
  )
}
