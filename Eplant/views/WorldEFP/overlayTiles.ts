import { OverlayType } from './types'

const BASE_URL =
  'https://bar.utoronto.ca/eplant/src/Eplant.Views/WorldView/Tiles'

type OverlayConfig = {
  dir: string
  prefix: string
  maxZoom: number
}

const OVERLAY_CONFIG: Record<
  Exclude<OverlayType, OverlayType.None>,
  OverlayConfig
> = {
  [OverlayType.Precipitation]: {
    dir: 'AnnualPrecip',
    prefix: 'Annual_Precipitation',
    maxZoom: 8,
  },
  [OverlayType.HistoricalMinTemp]: {
    dir: 'HistMin',
    prefix: 'Historical_Min_Temp_of_coldest_Month',
    maxZoom: 8,
  },
  [OverlayType.HistoricalMaxTemp]: {
    dir: 'HistMax',
    prefix: 'Historical_Max_temp_of_warmest_month',
    maxZoom: 8,
  },
}

export function getOverlayMaxZoom(
  overlay: Exclude<OverlayType, OverlayType.None>
): number {
  return OVERLAY_CONFIG[overlay].maxZoom
}

export function getTileUrl(
  overlay: Exclude<OverlayType, OverlayType.None>,
  zoom: number,
  x: number,
  y: number
): string {
  const { dir, prefix } = OVERLAY_CONFIG[overlay]
  return `${BASE_URL}/${dir}/${prefix}&zoom=${zoom}&x=${x}&y=${y}.png`
}
