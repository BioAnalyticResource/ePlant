// Import necessary dependencies from Material-UI
import React, { useState } from 'react';
import { Modal, Slider, Typography, Button } from '@mui/material';
import { EFPViewerState } from './types';

// Modal component with a slider
interface MaskModalProps {
    state: EFPViewerState
    onClose: () => void
    onSubmit: (threshhold: number) => void
}

const MaskModal: React.FC<MaskModalProps> = ({ state, onClose, onSubmit }) => {
    const [sliderValue, setSliderValue] = useState<number>(state.maskThreshold);

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setSliderValue(newValue as number);
    };

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = () => {
        onSubmit(sliderValue);
        onClose();
    };

    return (
        <Modal open={state.maskModalVisible} onClose={handleClose}>
            <div style={{ width: 300, padding: 16, background: '#fff', margin: 'auto', marginTop: 100 }}>
                <Typography variant="h6" gutterBottom>
                    Select Percentage
                </Typography>
                <Slider
                    value={sliderValue}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    marks
                    step={1}
                    min={0}
                    max={100}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button onClick={handleClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default MaskModal;
