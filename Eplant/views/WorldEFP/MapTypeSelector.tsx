import { useState } from 'react'

import MapIcon from '@mui/icons-material/Map'
import { Box, Button, Collapse } from '@mui/material'
import { alpha } from '@mui/material/styles'

import { WorldEFPState } from './types'

const MAP_TYPES = ['roadmap', 'satellite', 'hybrid', 'terrain'] as const

type MapTypeSelectorProps = {
  mapTypeId: WorldEFPState['mapTypeId']
  onSelect: (mapTypeId: WorldEFPState['mapTypeId']) => void
}

const MapTypeSelector = ({ mapTypeId, onSelect }: MapTypeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleMapTypeSelect = (nextType: WorldEFPState['mapTypeId']) => {
    onSelect(nextType)
    setIsOpen(false)
  }

  const formatMapTypeLabel = (type: WorldEFPState['mapTypeId']) =>
    type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <Box
      sx={(theme) => ({
        width: isOpen ? theme.spacing(15) : theme.spacing(5),
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
          color: theme.palette.text.primary,
          padding: theme.spacing(1),
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.active, 0.85),
          },
        })}
      >
        <MapIcon fontSize='small' />
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
          {formatMapTypeLabel(mapTypeId)}
        </Box>
      </Button>
      <Collapse in={isOpen} timeout={200} unmountOnExit>
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(0.5),
            padding: theme.spacing(0.5, 1, 1),
          })}
        >
          {MAP_TYPES.map((type) => (
            <Button
              key={type}
              variant='text'
              onClick={() => handleMapTypeSelect(type)}
              sx={(theme) => ({
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: theme.palette.text.primary,
                padding: theme.spacing(0.5, 1),
                '&:hover': {
                  backgroundColor: alpha(
                    theme.palette.background.active,
                    0.45
                  ),
                },
                ...(mapTypeId === type && {
                  fontWeight: 600,
                  backgroundColor: alpha(
                    theme.palette.background.active,
                    0.6
                  ),
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
              {formatMapTypeLabel(type)}
            </Button>
          ))}
        </Box>
      </Collapse>
    </Box>
  )
}

export default MapTypeSelector
