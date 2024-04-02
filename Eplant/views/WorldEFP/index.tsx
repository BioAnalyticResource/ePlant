import { useEffect } from 'react'
import { random } from 'lodash'
import ReactDOMServer from 'react-dom/server'

import GeneticElement from '@eplant/GeneticElement'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'
import { APIProvider } from '@vis.gl/react-google-maps'

import MapContainer from './MapContainer'
import { Coordinates, WorldEFPData, WorldEFPState } from './types'
const WorldEFP: View<WorldEFPData, WorldEFPState, any> = {
  name: 'World-EFP',
  id: 'World-EFP',
  getInitialState() {
    return {
      position: { lat: 25, lng: 0 },
      zoom: 2,
      mapTypeId: 'roadmap',
      maskingEnabled: false,
      maskModalVisibile: false,
      maskingThreshold: 100,
      colorMode: 'absolute',
    }
  },
  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    if (!gene) throw ViewDataError.UNSUPPORTED_GENE
    const markersURL =
      'https://bar.utoronto.ca/eplant/data/world/Arabidopsis_thaliana.json'
    const sampleSet: Set<string> = new Set()
    const positions: Coordinates[] = []
    const markerData = await fetch(markersURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .catch((error) => {
        console.error('Error fetching map marker data:', error)
        throw error
      })
    const markerSVG = markerData['markers']
    const webservice = 'https:' + markerData['webService']
    markerData['groups'].forEach(
      (group: {
        samples: string[]
        ctrlSamples: string[]
        position: { lat: string; lng: string }
      }) => {
        group['samples'].forEach((sample: string) => {
          sampleSet.add(sample)
        })
        group['ctrlSamples'].forEach((sample: string) => {
          sampleSet.add(sample)
        })
        positions.push({
          lat: parseFloat(group['position'].lat),
          lng: parseFloat(group['position'].lng),
        })
      }
    )
    const efpURL = webservice + Array.from(sampleSet).toString()
    const efpData: { name: string; value: string }[] = await fetch(efpURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .catch((error) => {
        console.error('Error fetching world efp data:', error)
        throw error
      })

    // Putting efp data into hash map
    const efpValues = efpData.reduce((acc, obj) => {
      acc.set(obj.name, parseFloat(obj.value))
      return acc
    }, new Map())
    const svgString = SVGRenderer(markerSVG)
    return { positions: positions, markerSVGString: svgString }
  },
  component({
    geneticElement,
    activeData,
    state,
  }: ViewProps<WorldEFPData, WorldEFPState, any>) {
    if (!geneticElement) return <></>
    else
      return (
        <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
          <MapContainer activeData={activeData} state={state}></MapContainer>
        </APIProvider>
      )
  },
  icon: () => <div></div>,
  description: 'Find publications that mention your gene of interest.',
  // TODO: If dark theme is active, use ThumbnailDark
  citation({ gene }) {
    return <div></div>
  },
}

interface SVGObj {
  paths: string[]
  height: number
  width: number
}
function SVGRenderer({ paths, height, width }: SVGObj) {
  // Map through the paths array and create a Path element for each
  const pathDataStrings = paths.map((path) => `<path d="${path}" />`)

  // Concatenate all path strings into a single string
  const pathsString = pathDataStrings.join('')

  // Construct the SVG string with the paths and dimensions
  const svgString = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                      ${pathsString}
                    </svg>`
  console.log(svgString, paths)
  return svgString
}
export default WorldEFP
