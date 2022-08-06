import { Theme, useTheme } from '@mui/material'
import DOMPurify from 'dompurify'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import * as React from 'react'
import { ViewProps } from '../View'
import { EFPAction, EFPData, EFPId, EFPSVGCache } from './types'
import { mix } from 'color2k'

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

  // Reset the styles of all of the text tags in the svg
  return React.useMemo(() => {
    if (!cache[view.id]) return { view: null, loading: true }
    const parser = new DOMParser()
    const svg = parser.parseFromString(cache[view.id].svg, 'text/xml')
    ;['width', 'height', 'x', 'y', 'id'].map((s) =>
      svg.documentElement.removeAttribute(s)
    )
    svg.documentElement.setAttribute('class', 'eFP-svg')
    // Remove styling from all of the text tags
    for (const text of svg.getElementsByTagName('text')) {
      ;[
        'stroke',
        'fill',
        'stroke-width',
        'font-family',
        'stroke-miterlimit',
        'display',
      ].map((s) => text.removeAttribute(s))
      if (!options.showText) text.style.display = 'none'
    }

    // Replace all group ids with classes
    for (const g of svg.getElementsByTagName('g')) {
      g.setAttribute('class', g.getAttribute('id') ?? '')
      g.removeAttribute('id')
    }

    const out = {
      ...cache[view.id],
      //DOMPurify.sanitize(
      svg: `<div id=${view.id}>${new XMLSerializer().serializeToString(
        svg
      )}</div>`,
      //),
    }

    return { view: out, loading: false }
  }, [cache[view.id]])
}

export function getColor(
  value: number,
  group: EFPData['groups'][number],
  theme: Theme
): string {
  const extremum = Math.max(
    Math.abs(Math.log2(group.min / group.control)),
    Math.log2(group.max / group.control)
  )
  const norm = Math.log2(value / group.control) / extremum
  return norm < 0
    ? mix(
        theme.palette.background.active,
        theme.palette.cold.main,
        Math.abs(norm)
      )
    : mix(theme.palette.background.active, theme.palette.hot.main, norm)
}

export function useStyles(id: string, data: EFPData['groups']) {
  const theme = useTheme()
  const samples = data
    .flatMap((group) =>
      group.tissues.map(
        (tissue) =>
          `.${id} .${tissue.id} * { fill: ${getColor(
            tissue.value,
            group,
            theme
          )} }`
      )
    )
    .join('\n')
  return `${samples}
  .${id} text {
    fill: ${theme.palette.text.primary};
  }
  .${id} #outlines path {
    stroke: ${theme.palette.text.primary};
  }
  `
}
