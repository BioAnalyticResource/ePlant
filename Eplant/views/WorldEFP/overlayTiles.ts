import { OverlayType } from './types'

export type TileMap = Record<string, string> // "zoom_x_y" -> URL

export type OverlayTileData = {
  tileMap: TileMap
  maxZoom: number
}

const BASE_PATH = '/temp_world_efp'

/**
 * Builds a tileMap by constructing public URLs for all tiles in a grid up to maxZoom.
 * At each zoom level z the grid is 2^z x 2^z.
 */
function buildTileMap(dir: string, prefix: string, maxZoom: number): OverlayTileData {
  const tileMap: TileMap = {}
  for (let zoom = 0; zoom <= maxZoom; zoom++) {
    const count = 1 << zoom
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        tileMap[`${zoom}_${x}_${y}`] =
          `${BASE_PATH}/${dir}/${prefix}&zoom=${zoom}&x=${x}&y=${y}.png`
      }
    }
  }
  return { tileMap, maxZoom }
}

/**
 * Fetches overlay tile data for the given overlay type.
 *
 * Currently a mock backed by files in public/temp_world_efp.
 * Replace each case body with a fetch() call to the real tile API endpoint
 * when available — the return type stays the same.
 */
export async function fetchOverlayTiles(
  overlay: Exclude<OverlayType, OverlayType.None>
): Promise<OverlayTileData> {
  switch (overlay) {
    case OverlayType.Precipitation:
      return buildTileMap('AnnualPrecip', 'Annual_Precipitation', 2)
    case OverlayType.HistoricalMinTemp:
      return buildTileMap('HistMin', 'Historical_Min_Temp_of_coldest_Month', 2)
    case OverlayType.HistoricalMaxTemp:
      return buildTileMap('HistMax', 'Historical_Max_temp_of_warmest_month', 2)
  }
}
