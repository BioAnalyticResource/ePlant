import { useEffect } from 'react'

import { View, ViewProps } from '@eplant/View'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'
const WorldEFP: View<any, any, any> = {
  name: 'World-EFP',
  id: 'World-EFP',
  component({ geneticElement, activeData }: ViewProps<any, any, any>) {
    const mapTypeIds = ['roadmap', 'satellite', 'hybrid', 'terrain']
    const position = { lat: 25, lng: 0 }
    const map = useMap()

    return (
      <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
        <div style={{ height: '100vh' }}>
          <Map
            mapTypeId={'roadmap'}
            mapTypeControlOptions={{
              mapTypeIds: [],
            }}
            zoom={2}
            zoomControl={false}
            center={position}
            streetViewControl={false}
          ></Map>
        </div>
      </APIProvider>
    )
  },
  icon: () => <div></div>,
  description: 'Find publications that mention your gene of interest.',
  // TODO: If dark theme is active, use ThumbnailDark
  citation({ gene }) {
    return <div></div>
  },
  async getInitialData() {
    // Loader override for the genes species must be undefined if getInitialData is being called
    return {}
  },
}

export default WorldEFP
