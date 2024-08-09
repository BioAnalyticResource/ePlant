import { useEffect, useState } from 'react'

import Modal from '@eplant/UI/Modal'
import { useTheme } from '@mui/material'
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps'

import { EFPGroup } from '../eFP/types'

import WorldEFPIcon from './icon'
import InfoContent from './InfoContent'
import { Coordinates } from './types'

interface MapMarkerProps {
  color: string
  position: Coordinates
  data: EFPGroup
}

const MapMarker = ({ data, color, position }: MapMarkerProps) => {
  const [showPopup, setShowPopup] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [markerRef, marker] = useAdvancedMarkerRef()
  const theme = useTheme()
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
      marker.addListener('gmp-click', () => {})
      marker.content?.addEventListener('mouseover', handleMouseOver)
      marker.content?.addEventListener('mouseout', handleMouseOut)

      return () => {
        marker.removeEventListener('mouseover', handleMouseOver)
        marker.removeEventListener('mouseout', handleMouseOut)
      }
    }
  }, [data])

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
      ></Modal>
    </>
  )
}

export default MapMarker
