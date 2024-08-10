import { useCallback } from 'react'

import { ViewDispatch } from '@eplant/View'
import { useTheme } from '@mui/material'
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  MapEvent,
  useMap,
} from '@vis.gl/react-google-maps'

import { getColor } from '../eFP/svg'
import GeneDistributionChart from '../eFP/Viewer/GeneDistributionChart'
import Legend from '../eFP/Viewer/legend'

import MapMarker from './MapMarker'
import { WorldEFPAction, WorldEFPData, WorldEFPState } from './types'

interface MapContainerProps {
  activeData: WorldEFPData
  state: WorldEFPState
  dispatch: ViewDispatch<WorldEFPAction>
}
const MapContainer = ({ activeData, state, dispatch }: MapContainerProps) => {
  const theme = useTheme()
  const map = useMap('WorldEFP')

  const hangleDragEnd = (event: MapEvent) => {
    const mapPos = map?.getCenter()
    if (!mapPos) return

    const coords = { lat: mapPos.lat(), lng: mapPos.lng() }
    dispatch({
      type: 'set-map-position',
      position: coords,
    })
  }

  const handleZoom = (event: MapCameraChangedEvent) => {
    dispatch({
      type: 'set-map-zoom',
      zoom: event.detail.zoom,
    })
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
