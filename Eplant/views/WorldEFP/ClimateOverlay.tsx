import { useEffect, useRef } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useMap } from '@vis.gl/react-google-maps'

import { fetchOverlayTiles, OverlayTileData } from './overlayTiles'
import { OverlayType } from './types'

const PLACEHOLDER_TILE = '/temp_world_efp/tile-placeholder.png'

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

  // Tile data is fetched independently — doesn't block the map from rendering.
  const { data: tileData } = useQuery({
    queryKey: ['overlay-tiles', overlay],
    queryFn: () =>
      fetchOverlayTiles(overlay as Exclude<OverlayType, OverlayType.None>),
    enabled: overlay !== OverlayType.None,
  })

  // Keep a ref to the latest tile data so the getTileUrl closure always reads
  // the most recent data without needing to recreate the ImageMapType layer.
  const tileDataRef = useRef<OverlayTileData | null>(null)
  useEffect(() => {
    tileDataRef.current = tileData ?? null
  }, [tileData])

  // Keep a ref to the active layer so we can force a tile refresh when data loads.
  const layerRef = useRef<google.maps.ImageMapType | null>(null)

  // Register / unregister the ImageMapType layer whenever the overlay or map changes.
  useEffect(() => {
    if (!map || !window.google?.maps || overlay === OverlayType.None) return

    const layer = new window.google.maps.ImageMapType({
      getTileUrl: (coord: google.maps.Point, zoom: number): string | null => {
        if (zoom > 8) return null

        const normalized = normalizeTileCoord(coord, zoom)
        if (!normalized) return null

        const { x, y } = normalized
        const tileMap = tileDataRef.current?.tileMap
        const url = tileMap?.[`${zoom}_${x}_${y}`]
        return url ?? PLACEHOLDER_TILE
      },
      tileSize: new window.google.maps.Size(256, 256),
      opacity: 0.7,
      name: overlay,
    })

    layerRef.current = layer
    map.overlayMapTypes.push(layer)

    return () => {
      const index = map.overlayMapTypes.getArray().indexOf(layer)
      if (index !== -1) map.overlayMapTypes.removeAt(index)
      layerRef.current = null
    }
  }, [map, overlay])

  // When tile data finishes loading, force a tile refresh by removing and
  // re-inserting the layer at the same position so grey placeholders are replaced.
  useEffect(() => {
    if (!tileData || !map || !layerRef.current) return
    const layer = layerRef.current
    const index = map.overlayMapTypes.getArray().indexOf(layer)
    if (index !== -1) {
      map.overlayMapTypes.removeAt(index)
      map.overlayMapTypes.insertAt(index, layer)
    }
  }, [tileData, map])

  return null
}

export default ClimateOverlay
