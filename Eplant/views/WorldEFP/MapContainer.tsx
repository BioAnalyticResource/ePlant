import { min, random } from 'lodash'

import {
  AdvancedMarker,
  Map,
  Marker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps'

import Icon from '../CellEFP/icon'

import { WorldEFPData, WorldEFPState } from './types'

interface MapContainerProps {
  activeData: WorldEFPData
  state: WorldEFPState
}
const MapContainer = ({ activeData, state }: MapContainerProps) => {
  const map = useMap()
  //   const parser = new DOMParser()
  //   const svg = parser.parseFromString(
  //     activeData.markerSVGString,
  //     'image/svg+xml'
  //   ).documentElement
  console.log(activeData.markerSVGString)
  return (
    <div style={{ height: '100vh' }}>
      <Map
        mapId={'2311f7af1b919095'}
        mapTypeId={'roadmap'}
        mapTypeControlOptions={{
          mapTypeIds: [],
        }}
        defaultZoom={4}
        defaultCenter={{ lat: 45, lng: 25 }}
        streetViewControl={false}
      >
        {activeData.positions.map((position) => {
          return (
            <AdvancedMarker
              key={position.lat}
              position={position}
            ></AdvancedMarker>
          )
        })}
      </Map>
    </div>
  )
}

export default MapContainer
