// Import necessary dependencies from Material-UI
import { useState } from 'react'

import {
  Button,
  DialogTitle,
  Modal,
  Slider,
  Typography,
  useTheme,
} from '@mui/material'

import { EFPViewerState } from './types'

// Modal component with a slider
interface MaskModalProps {
  state: EFPViewerState
  onClose: () => void
  onSubmit: (threshhold: number) => void
}

const MaskModal = ({ state, onClose, onSubmit }: MaskModalProps) => {
  const [sliderValue, setSliderValue] = useState<number>(state.maskThreshold)
  const theme = useTheme()
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number)
  }

  const handleClose = () => {
    setSliderValue(state.maskThreshold)
    onClose()
  }

  const handleSubmit = () => {
    onSubmit(sliderValue)
  }
  return (
    <Modal open={state.maskModalVisible} onClose={handleClose}>
      <div
        style={{
          width: 500,
          padding: 16,
          gap: 16,
          background: theme.palette.background.paperOverlay,
          margin: 'auto',
          marginTop: 100,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <DialogTitle sx={{ minWidth: '512px', padding: 0 }}>
          Mask data
        </DialogTitle>
        <Typography variant='body2' gutterBottom>
          Mask samples if the expression level is below a given percentile of
          the standard deviation.
        </Typography>
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          valueLabelDisplay='on'
          valueLabelFormat={(value) => `${value}%`}
          min={0}
          max={200}
          sx={{ width: 400 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleClose}
            style={{ marginRight: 8, color: theme.palette.secondary.main }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            sx={{ background: theme.palette.primary.main }}
            onClick={handleSubmit}
          >
            Mask Thresholds
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default MaskModal
