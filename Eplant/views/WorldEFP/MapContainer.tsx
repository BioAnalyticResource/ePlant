import { useState } from 'react'

import { useSidebarState } from '@eplant/state'
import { useTheme } from '@mui/material'
import { APIProvider, Map } from '@vis.gl/react-google-maps'

import { getColor } from '../eFP/svg'
import GeneDistributionChart from '../eFP/Viewer/GeneDistributionChart'
import Legend from '../eFP/Viewer/legend'

import MapMarker from './MapMarker'
import { WorldEFPData, WorldEFPState } from './types'

interface MapContainerProps {
  activeData: WorldEFPData
  state: WorldEFPState
}
const MapContainer = ({ activeData, state }: MapContainerProps) => {
  const defaultCenter = { lat: 49, lng: 11 }
  const theme = useTheme()

  return (
    <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY} version='beta'>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={10}
        mapId={import.meta.env.VITE_MAP_ID}
        streetViewControl={false}
        mapTypeId={'roadmap'}
        mapTypeControl={false}
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
    </APIProvider>
  )
}

export default MapContainer
