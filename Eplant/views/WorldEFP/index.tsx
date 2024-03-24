import { View, ViewProps } from '@eplant/View'
import {
  APIProvider,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
} from '@vis.gl/react-google-maps'
const WorldEFP: View<any, any, any> = {
  name: 'World-EFP',
  id: 'World-EFP',
  component({ geneticElement, activeData }: ViewProps<any, any, any>) {
    const position = { lat: 53.54, lng: 10 }
    return (
      <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
        <div style={{ height: '100vh' }}>
          <Map zoom={9} center={position}>
            <MapControl position={ControlPosition.BOTTOM_LEFT}>
              <div>Hi</div>
            </MapControl>
          </Map>
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
