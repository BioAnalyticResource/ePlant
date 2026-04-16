import { useEffect } from 'react'

import { Box, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Map,
  MapCameraChangedEvent,
  MapEvent,
  useMap,
} from '@vis.gl/react-google-maps'

import { getColor } from '../eFP/svg'
import GeneDistributionChart from '../eFP/Viewer/GeneDistributionChart'
import Legend from '../eFP/Viewer/legend'

import ClimateOverlay from './ClimateOverlay'
import MapMarker from './MapMarker'
import MapTypeSelector from './MapTypeSelector'
import OverlayLegend from './OverlayLegend'
import OverlaySelector from './OverlaySelector'
import { ColorMode, WorldEFPData, WorldEFPState } from './types'

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
      mapTypeId={state.mapTypeId}
      mapTypeControl={false}
      onDragend={hangleDragEnd}
      onZoomChanged={handleZoom}
      id='WorldEFP'
    >
      <ClimateOverlay overlay={state.overlay} />
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
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: theme.spacing(2),
          top: theme.spacing(2),
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(1),
        })}
      >
        <MapTypeSelector
          mapTypeId={state.mapTypeId}
          onSelect={(mapTypeId) => setState({ ...state, mapTypeId })}
        />
        <OverlaySelector
          overlay={state.overlay}
          onSelect={(overlay) => setState({ ...state, overlay })}
        />
      </Box>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: theme.spacing(2),
          bottom: theme.spacing(4),
          zIndex: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: theme.spacing(1),
        })}
      >
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: theme.spacing(1),
            padding: theme.spacing(1),
            borderRadius: theme.spacing(1),
            backgroundColor: alpha(theme.palette.background.active, 0.4),
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            border: `1px solid ${alpha(theme.palette.background.edge, 0.7)}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          })}
        >
          <GeneDistributionChart
            data={activeData.efpData}
            containerStyle={{
              position: 'static',
              width: 'auto',
              height: 'auto',
              marginLeft: '-12px',
            }}
          />
          <Legend colorMode={ColorMode.Absolute} data={activeData.efpData} />
        </Box>
        <OverlayLegend overlay={state.overlay} />
      </Box>
    </Map>
  )
}

export default MapContainer
