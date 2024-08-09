import { MouseEvent, useState } from 'react'

import { useSidebarState } from '@eplant/state'
import { sidebarWidth } from '@eplant/UI/Sidebar'
import { useTheme } from '@mui/material'
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps'

import { getColor } from '../eFP/svg'
import GeneDistributionChart from '../eFP/Viewer/GeneDistributionChart'
import Legend from '../eFP/Viewer/legend'

import WorldEFPIcon from './icon'
import InfoContent from './InfoContent'
import { WorldEFPData, WorldEFPState } from './types'

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

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>, id: string) => {
    if (!infoWindowShown) {
      setInfoWindowShown(true)
      const mouseX = isCollapse ? event.clientX : event.clientX - sidebarWidth
      const mouseY = event.clientY
      setMousePosition({
        x: mouseX,
        y: mouseY,
      })
      setHoveredMarkerId(id)
    }
  }

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
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
          const colour = getColor(
            activeData.efpData.groups[index].mean,
            activeData.efpData.groups[index],
            1,
            theme,
            state.colorMode,
            activeData.efpData.groups[index].std,
            state.maskThreshold,
            state.maskingEnabled
          )
          const markerId = activeData.efpData.groups[index].name

          return (
            <>
              <div
                onMouseOver={(event) => handleMouseEnter(event, markerId)}
                onMouseLeave={handleMouseLeave}
                style={{
                  width: 30,
                  height: 30,
                  position: 'absolute',
                  opacity: 1,
                  backgroundColor: 'rgba(52, 52, 52, 0)',
                }}
              >
                <AdvancedMarker key={index} position={pos}>
                  <WorldEFPIcon sx={{ fill: colour }}></WorldEFPIcon>
                </AdvancedMarker>
              </div>
              {infoWindowShown && markerId === hoveredMarkerId && (
                <InfoContent
                  id={activeData.efpData.groups[index].name}
                  mean={activeData.efpData.groups[index].mean}
                  std={activeData.efpData.groups[index].std}
                  sampleSize={activeData.efpData.groups[index].samples}
                  pos={mousePosition}
                ></InfoContent>
              )}
            </>
          )
        })}
        <Legend
          sx={(theme) => ({
            position: 'absolute',
            left: theme.spacing(2),
            bottom: theme.spacing(4),
            zIndex: 10,
          })}
          colorMode={'absolute'}
          data={activeData.efpData}
        ></Legend>
        <GeneDistributionChart data={activeData.efpData} />
      </Map>
    </APIProvider>
  )
}

export default MapContainer
