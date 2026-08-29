import { useEffect } from 'react'

import { useMap } from '@vis.gl/react-google-maps'

import { getOverlayMaxZoom, getTileUrl } from './overlayTiles'
import { OverlayType } from './types'

/**
 * Normalizes tile coordinates per Google Maps conventions.
 * - Does NOT repeat across the y-axis (returns null for out-of-bounds y)
 * - Wraps across the x-axis (world repeats horizontally)
 *
 * Ported from the original WorldView implementation.
 */
function normalizeTileCoord(
  coord: google.maps.Point,
  zoom: number
): { x: number; y: number } | null {
  const tileRange = 1 << zoom
  const y = coord.y
  let x = coord.x

  if (y < 0 || y >= tileRange) return null
  if (x < 0 || x >= tileRange) {
    x = ((x % tileRange) + tileRange) % tileRange
  }
  return { x, y }
}

interface ClimateOverlayProps {
  overlay: OverlayType
}

const ClimateOverlay = ({ overlay }: ClimateOverlayProps) => {
  const map = useMap('WorldEFP')

  useEffect(() => {
    if (!map || !window.google?.maps || overlay === OverlayType.None) return

    const typedOverlay = overlay as Exclude<OverlayType, OverlayType.None>
    const maxZoom = getOverlayMaxZoom(typedOverlay)

    const layer = new window.google.maps.ImageMapType({
      getTileUrl: (coord: google.maps.Point, zoom: number): string | null => {
        if (zoom > maxZoom) return null

        const normalized = normalizeTileCoord(coord, zoom)
        if (!normalized) return null

        const { x, y } = normalized
        return getTileUrl(typedOverlay, zoom, x, y)
      },
      tileSize: new window.google.maps.Size(256, 256),
      opacity: 0.7,
      name: overlay,
    })

    map.overlayMapTypes.push(layer)

    return () => {
      const index = map.overlayMapTypes.getArray().indexOf(layer)
      if (index !== -1) map.overlayMapTypes.removeAt(index)
    }
  }, [map, overlay])

  return null
}

export default ClimateOverlay
