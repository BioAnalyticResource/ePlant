// Import necessary dependencies from Material-UI
import React, { useState } from 'react';
import { Modal, Slider, Typography, Button, useTheme } from '@mui/material';
import { EFPViewerState } from './types';

// Modal component with a slider
interface MaskModalProps {
    state: EFPViewerState
    onClose: () => void
    onSubmit: (threshhold: number) => void
}

const MaskModal: React.FC<MaskModalProps> = ({ state, onClose, onSubmit }) => {
    const [sliderValue, setSliderValue] = useState<number>(state.maskThreshold);
    const theme = useTheme()
    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setSliderValue(newValue as number);
    };

    const handleClose = () => {
        setSliderValue(state.maskThreshold)
        onClose();
    };

    const handleSubmit = () => {
        onSubmit(sliderValue);
        onClose();
    };

    return (
        <Modal open={state.maskModalVisible} onClose={handleClose}>
            <div style={{
                width: 350,
                height: 200,
                padding: 20,
                background: theme.palette.background.paperOverlay,
                margin: 'auto',
                marginTop: 100,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
                <Typography variant="body2" gutterBottom>
                    Mask samples if the expression level is within a given range of their standard deviation.
                </Typography>
                <Slider
                    value={sliderValue}
                    onChange={handleSliderChange}
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => `${value}%`}
                    min={0}
                    max={100}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="inherit" onClick={handleSubmit}>
                        Mask Thresholds
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default MaskModal;
