import { MouseEvent, useState } from 'react'

import { useSidebarState } from '@eplant/state'
import { sidebarWidth } from '@eplant/UI/Sidebar'
import { useTheme } from '@mui/material'
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps'

import WorldEFPIcon from './icon'
import InfoContent from './InfoContent'
import { WorldEFPData, WorldEFPState } from './types'
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
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string>('')
  const [isCollapse] = useSidebarState()

  const handleMouseOver = (event: MouseEvent<HTMLDivElement>, id: string) => {
    setInfoWindowShown(true)
    const mouseX = isCollapse ? event.clientX : event.clientX - sidebarWidth
    const mouseY = event.clientY
    setMousePosition({
      x: mouseX,
      y: mouseY,
    })
    setHoveredMarkerId(id)
  }

  const handleMouseOut = (event: MouseEvent<HTMLDivElement>) => {
    setInfoWindowShown(false)
    setMousePosition({
      x: 0,
      y: 0,
    })
    setHoveredMarkerId('')
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
          const markerId = activeData.efpData[index].id

          return (
            <>
              <AdvancedMarker key={index} position={pos}>
                <div
                  onMouseOver={(event) => handleMouseOver(event, markerId)}
                  onMouseLeave={handleMouseOut}
                  style={{
                    width: 24,
                    height: 24,
                    position: 'absolute',
                    opacity: 0,
                    backgroundColor: 'white',
                  }}
                ></div>
                <WorldEFPIcon sx={{ fill: colour }}></WorldEFPIcon>
              </AdvancedMarker>
              {infoWindowShown && markerId === hoveredMarkerId && (
                <InfoContent
                  id={activeData.efpData[index].name}
                  mean={activeData.efpData[index].mean}
                  std={activeData.efpData[index].std}
                  sampleSize={activeData.efpData[index].sampleSize}
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
