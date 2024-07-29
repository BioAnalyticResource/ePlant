import { MouseEvent, useState } from 'react'
import { random } from 'lodash'

import { useTheme } from '@mui/material'
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps'

import WorldEFPIcon from './icon'
import InfoContent from './InfoContent'
import { Coordinates, WorldEFPData, WorldEFPState } from './types'
import { getWorldEFPColour } from './utils'

interface MapContainerProps {
  activeData: WorldEFPData
  state: WorldEFPState
}
const MapContainer = ({ activeData, state }: MapContainerProps) => {
  const defaultCenter = { lat: 49, lng: 11 }
  const theme = useTheme()
  const [infoWindowShown, setInfoWindowShown] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseOver = (event: MouseEvent<HTMLDivElement>) => {
    console.log('yo')
    setInfoWindowShown(true)
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  const handleMouseOut = (event: MouseEvent<HTMLDivElement>) => {
    setInfoWindowShown(false)
    setMousePosition({
      x: 0,
      y: 0,
    })
  }
  return (
    <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY} version='beta'>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={10}
        mapId={import.meta.env.VITE_MAP_ID}
      >
        {activeData.positions.map((pos, index) => {
          const colour = getWorldEFPColour(
            theme,
            activeData.efpData[index].mean,
            activeData.efpMax
          )
          return (
            <>
              <AdvancedMarker key={index} position={pos}>
                <div
                  onMouseOver={handleMouseOver}
                  onMouseLeave={handleMouseOut}
                  style={{
                    width: 24,
                    height: 24,
                    position: 'absolute',
                    opacity: 1,
                    backgroundColor: 'white',
                  }}
                ></div>
                <WorldEFPIcon sx={{ fill: colour }}></WorldEFPIcon>
              </AdvancedMarker>
              {infoWindowShown && (
                <InfoContent
                  id={'asd'}
                  mean={12}
                  std={12}
                  sample_size={12}
                  pos={mousePosition}
                ></InfoContent>
              )}
            </>
          )
        })}
      </Map>
    </APIProvider>
  )
}

export default MapContainer
