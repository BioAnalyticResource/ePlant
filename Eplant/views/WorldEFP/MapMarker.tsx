import { useEffect, useState } from 'react'

import Modal from '@eplant/UI/Modal'
import { Theme, useTheme } from '@mui/material'
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps'

import { EFPGroup } from '../eFP/types'

import WorldEFPIcon from './icon'
import InfoContent from './InfoContent'
import { ModalContent } from './ModalContent'
import { Coordinates } from './types'

interface MapMarkerProps {
  theme: Theme
  color: string
  position: Coordinates
  data: EFPGroup
}

const MapMarker = ({ theme, data, color, position }: MapMarkerProps) => {
  const [showPopup, setShowPopup] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [markerRef, marker] = useAdvancedMarkerRef()
  const handleMouseOver = () => {
    setShowPopup(true)
  }

  const handleMouseOut = () => {
    setShowPopup(false)
  }

  const handleClick = () => {
    setShowPopup(false)
    setShowModal(true)
  }

  useEffect(() => {
    if (marker) {
      marker.addListener('gmp-click', () => {}) // Need this to have mouseover logic work for some reason
      marker.content?.addEventListener('mouseover', handleMouseOver)
      marker.content?.addEventListener('mouseout', handleMouseOut)

      return () => {
        marker.content?.removeEventListener('mouseover', handleMouseOver)
        marker.content?.removeEventListener('mouseout', handleMouseOut)
      }
    }
  }, [data, marker])

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        clickable={true}
        onClick={handleClick}
      >
        <WorldEFPIcon sx={{ fill: color }} />
      </AdvancedMarker>
      {showPopup && (
        <InfoWindow
          anchor={marker}
          maxWidth={300}
          disableAutoPan={true}
          headerDisabled={true}
        >
          <InfoContent
            id={data.name}
            mean={data.mean}
            std={data.std}
            sampleSize={data.samples}
          ></InfoContent>
        </InfoWindow>
      )}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false)
        }}
      >
        <ModalContent
          theme={theme}
          id={data.name}
          mean={data.mean}
          std={data.std}
          sampleSize={data.samples}
        ></ModalContent>
      </Modal>
    </>
  )
}

export default MapMarker
