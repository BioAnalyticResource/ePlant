import { useEffect } from 'react'

import { useTheme } from '@mui/material'
import {
  Map,
  MapCameraChangedEvent,
  MapEvent,
  useMap,
} from '@vis.gl/react-google-maps'

import { getColor } from '../eFP/svg'
import GeneDistributionChart from '../eFP/Viewer/GeneDistributionChart'
import Legend from '../eFP/Viewer/legend'

import MapMarker from './MapMarker'
import { WorldEFPData, WorldEFPState } from './types'

interface MapContainerProps {
  activeData: WorldEFPData
  state: WorldEFPState
  setState: (state: WorldEFPState) => void
}
const MapContainer = ({ activeData, state, setState }: MapContainerProps) => {
  const theme = useTheme()
  const map = useMap('WorldEFP')

  // set map state on load from cache, url or default
  useEffect(() => {
    map?.moveCamera({ zoom: state.zoom, center: state.position })
  }, [map])

  const hangleDragEnd = (event: MapEvent) => {
    const mapPos = map?.getCenter()
    if (!mapPos) return

    const coords = { lat: mapPos.lat(), lng: mapPos.lng() }
    setState({ ...state, position: coords })
  }

  const handleZoom = (event: MapCameraChangedEvent) => {
    setState({ ...state, zoom: event.detail.zoom })
  }

  return (
    <Map
      defaultCenter={state.position}
      defaultZoom={2}
      mapId={import.meta.env.VITE_MAP_ID}
      streetViewControl={false}
      mapTypeId={'roadmap'}
      mapTypeControl={false}
      onDragend={hangleDragEnd}
      onZoomChanged={handleZoom}
      id='WorldEFP'
    >
      {activeData.positions.map((pos, index) => {
        const color = getColor(
          activeData.efpData.groups[index].mean,
          activeData.efpData.groups[index],
          1,
          theme,
          state.colorMode,
          activeData.efpData.groups[index].std,
          state.maskThreshold,
          state.maskingEnabled
        )
        return (
          <MapMarker
            theme={theme}
            key={index}
            color={color}
            data={activeData.efpData.groups[index]}
            position={pos}
          ></MapMarker>
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
  )
}

export default MapContainer
