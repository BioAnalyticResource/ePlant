import { useState } from 'react'

import LayersIcon from '@mui/icons-material/Layers'
import { Box, Button, Collapse } from '@mui/material'
import { alpha } from '@mui/material/styles'

import { OverlayType, WorldEFPState } from './types'

const OVERLAY_LABELS: Record<OverlayType, string> = {
  [OverlayType.None]: 'None',
  [OverlayType.Precipitation]: 'Annual Precip.',
  [OverlayType.HistoricalMinTemp]: 'Min. Temp.',
  [OverlayType.HistoricalMaxTemp]: 'Max. Temp.',
}

const OVERLAY_TYPES = Object.values(OverlayType)

type OverlaySelectorProps = {
  overlay: WorldEFPState['overlay']
  onSelect: (overlay: WorldEFPState['overlay']) => void
}

const OverlaySelector = ({ overlay, onSelect }: OverlaySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (next: OverlayType) => {
    onSelect(next)
    setIsOpen(false)
  }

  return (
    <Box
      sx={(theme) => ({
        width: isOpen ? theme.spacing(20) : theme.spacing(5),
        borderRadius: theme.spacing(1),
        backgroundColor: alpha(theme.palette.background.active, 0.7),
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
        border: `1px solid ${alpha(theme.palette.background.active, 0.7)}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflow: 'hidden',
        transition: 'width 220ms ease, box-shadow 220ms ease',
      })}
    >
      <Button
        variant='text'
        onClick={() => setIsOpen((open) => !open)}
        sx={(theme) => ({
          width: '100%',
          justifyContent: 'flex-start',
          textTransform: 'none',
          color:
            overlay !== OverlayType.None
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          padding: theme.spacing(1),
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.active, 0.85),
          },
        })}
      >
        <LayersIcon fontSize='small' />
        <Box
          sx={(theme) => ({
            marginLeft: theme.spacing(1),
            opacity: isOpen ? 1 : 0,
            maxWidth: isOpen ? theme.spacing(12) : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'opacity 200ms ease, max-width 220ms ease',
          })}
        >
          {OVERLAY_LABELS[overlay]}
        </Box>
      </Button>
      <Collapse in={isOpen} timeout={200} unmountOnExit>
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(0.5),
            padding: theme.spacing(0.5, 1, 1),
            minWidth: theme.spacing(20),
          })}
        >
          {OVERLAY_TYPES.map((type) => (
            <Button
              key={type}
              variant='text'
              onClick={() => handleSelect(type)}
              sx={(theme) => ({
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: theme.palette.text.primary,
                padding: theme.spacing(0.5, 1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.active, 0.45),
                },
                ...(overlay === type && {
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.background.active, 0.6),
                  borderRadius: theme.spacing(0.75),
                  '&:hover': {
                    backgroundColor: alpha(
                      theme.palette.background.active,
                      0.7
                    ),
                  },
                }),
              })}
            >
              {OVERLAY_LABELS[type]}
            </Button>
          ))}
        </Box>
      </Collapse>
    </Box>
  )
}

export default OverlaySelector
