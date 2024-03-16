import { useMemo } from 'react'
import { mix } from 'color2k'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { Theme, useTheme } from '@mui/material'

import { ColorMode, EFPData, EFPId, EFPSampleData, EFPSVGCache } from './types'

const cacheAtom = atomWithStorage<EFPSVGCache>('eFP_cache', {})

const promises: {
  [key: EFPId]: Promise<[string, string]>
} = {}

export const useEFPSVG = (
  view: {
    svgURL: string
    xmlURL: string
    id: string
  },
  options: { showText: boolean }
): { view: { svg: string; xml: string } | null; loading: boolean } => {
  const [cache, setCache] = useAtom(cacheAtom)
  // If the svg is not cached the fetch it
  if (!cache[view.id] && !promises[view.id]) {
    Promise.all([fetch(view.svgURL), fetch(view.xmlURL)])
      .then(([svg, xml]) => Promise.all([svg.text(), xml.text()]))
      .then((val) => {
        setCache((prev) => ({
          ...prev,
          [view.id]: {
            svg: val[0],
            xml: val[1],
            id: view.id,
          },
        }))
      })
  }
  const svgInformation = [...Object.values(cache[view.id] ?? {})]

  // Reset the styles of all of the text tags in the svg
  return useMemo(() => {
    if (!cache[view.id]) return { view: null, loading: true }
    const parser = new DOMParser()
    const svg = parser.parseFromString(cache[view.id].svg, 'text/xml')
    ;['width', 'height', 'x', 'y', 'id'].map((s) =>
      svg.documentElement.removeAttribute(s)
    )
    svg.documentElement.setAttribute('class', 'eFP-svg')
    // Remove styling from all of the text tags
    for (const text of svg.querySelectorAll('text, tspan')) {
      ;[
        'stroke',
        'fill',
        'stroke-width',
        'font-family',
        'stroke-miterlimit',
        'display',
      ].map((s) => text.removeAttribute(s))
      if (!options.showText) (text as SVGTextElement).style.display = 'none'
    }

    // Replace all group ids with classes
    for (const g of svg.querySelectorAll('g, path')) {
      if (g.getAttribute('id')) {
        g.setAttribute('class', 'efp-group-' + g.getAttribute('id') ?? '')
        g.removeAttribute('id')
      }
      //g.removeAttribute('fill')
    }

    const out = {
      ...cache[view.id],
      //DOMPurify.sanitize(
      svg: `${new XMLSerializer().serializeToString(svg)}`,
      //),
    }

    return { view: out, loading: false }
  }, [svgInformation, view.id, options.showText])
}

export function getColor(
  value: number,
  group: EFPSampleData,
  control: number,
  theme: Theme,
  colorMode: ColorMode,
  tissueStd?: number,
  maskThreshold?: number,
  maskingEnabled?: boolean
): string {
  const extremum = Math.max(
    Math.abs(Math.log2(group.min / control)),
    Math.log2(group.max / control),
    1
  )
  const masked =
    maskingEnabled && maskThreshold !== undefined && tissueStd
      ? isNaN(group.std) || tissueStd >= value * (maskThreshold / 100)
      : false
  const norm = Math.log2(value / control) / extremum
  if (masked) {
    return theme.palette.secondary.dark
  } else if (colorMode === 'relative')
    return norm < 0
      ? mix(theme.palette.neutral.main, theme.palette.cold.main, Math.abs(norm))
      : mix(theme.palette.neutral.main, theme.palette.hot.main, Math.abs(norm))
  else
    return mix(
      theme.palette.neutral.main,
      theme.palette.hot.main,
      value / group.max
    )
}

export function useStyles(
  id: string,
  { groups, control }: EFPData,
  colorMode: ColorMode,
  maskThreshold?: number,
  maskingEnabled?: boolean
) {
  const theme = useTheme()
  const samples = groups
    .flatMap((group) =>
      group.tissues.map(
        (tissue) => `
          #${id} .efp-group-${tissue.id} *, #${id} .efp-group-${
            tissue.id
          } { fill: ${getColor(
            tissue.mean,
            group,
            control ?? 1,
            theme,
            colorMode,
            tissue.std,
            maskThreshold,
            maskingEnabled
          )} !important; }`
      )
    )
    .join('\n')
  return `${samples}
  #${id} text, .${id} tspan {
    fill: ${theme.palette.text.primary} !important;
  }
  /*#${id} .efp-group-outlines path, #${id} .efp-group-Outlines path {
    stroke: ${theme.palette.secondary.main};
  }*/
  `
}
