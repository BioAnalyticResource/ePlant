import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

import { OverlayType } from './types'

interface OverlayLegendConfig {
  title: [string, string]
  imageSrc: string
  max: string
  min: string
}

const LEGEND_CONFIG: Record<
  Exclude<OverlayType, OverlayType.None>,
  OverlayLegendConfig
> = {
  [OverlayType.Precipitation]: {
    title: ['Annual', 'Precipitation'],
    imageSrc: '/img/climateLegend.png',
    max: '10577 mm',
    min: '13 mm',
  },
  [OverlayType.HistoricalMinTemp]: {
    title: ['Minimum', 'Temperature'],
    imageSrc: '/img/climateLegendFlip.png',
    max: '31.9 °C',
    min: '-27.8 °C',
  },
  [OverlayType.HistoricalMaxTemp]: {
    title: ['Maximum', 'Temperature'],
    imageSrc: '/img/climateLegendFlip.png',
    max: '31.9 °C',
    min: '-27.8 °C',
  },
}

interface OverlayLegendProps {
  overlay: OverlayType
}

const OverlayLegend = ({ overlay }: OverlayLegendProps) => {
  if (overlay === OverlayType.None) return null

  const { title, imageSrc, max, min } = LEGEND_CONFIG[overlay]

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1),
        backgroundColor: alpha(theme.palette.background.active, 0.4),
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
        border: `1px solid ${alpha(theme.palette.background.edge, 0.7)}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      })}
    >
      {/* Title */}
      <Box>
        {title.map((line) => (
          <Typography
            key={line}
            variant='caption'
            sx={(theme) => ({
              display: 'block',
              color: theme.palette.text.primary,
              fontWeight: 600,
              lineHeight: 1.2,
            })}
          >
            {line}
          </Typography>
        ))}
      </Box>

      {/* Scale image with max/min labels */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.75 }}>
        <Box
          component='img'
          src={imageSrc}
          sx={{ width: 16, height: 160, display: 'block' }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 160,
          }}
        >
          <Typography variant='caption' sx={{ lineHeight: 1 }}>
            {max}
          </Typography>
          <Typography variant='caption' sx={{ lineHeight: 1 }}>
            {min}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default OverlayLegend
