import { useTheme } from '@mui/material'
import DOMPurify from 'dompurify'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import * as React from 'react'
import { ViewProps } from '../View'
import { EFPAction, EFPData, EFPId, EFPSVGCache } from './types'

const cacheAtom = atomWithStorage<EFPSVGCache>('eFP_cache', {})

const promises: {
  [key: EFPId]: Promise<[string, string]>
} = {}

export const useEFPSVG = (view: {
  svgURL: string
  xmlURL: string
  id: string
}): { view: { svg: string; xml: string } | null; loading: boolean } => {
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
    return { view: null, loading: true }
  }

  // Reset the styles of all of the text tags in the svg
  return React.useMemo(() => {
    const parser = new DOMParser()
    const svg = parser.parseFromString(cache[view.id].svg, 'text/xml')
    Array.from(svg.getElementsByTagName('text')).forEach((text) => {
      ;[
        'stroke',
        'fill',
        'stroke-width',
        'font-family',
        'stroke-miterlimit',
      ].map((s) => text.removeAttribute(s))
    })
    const out = {
      ...cache[view.id],
      svg: DOMPurify.sanitize(
        `<div id=${view.id}>${new XMLSerializer().serializeToString(svg)}</div>`
      ),
    }

    return { view: out, loading: false }
  }, [cache[view.id]])
}

export function getColor(control: number, value: number) {
  return value / control > 0.5 ? '#00ff00' : '#ff0000'
}

export function useStyles(id: string, data: EFPData['groups']) {
  const theme = useTheme()
  const samples = data
    .flatMap((group) =>
      group.tissues.map(
        (tissue) =>
          `#${tissue.id} * { fill: ${getColor(group.control, tissue.value)} }`
      )
    )
    .join('\n')
  return `${samples}
  #${id} text {
    fill: ${theme.palette.text.primary};
  }
  #${id} #outlines path {
    stroke: ${theme.palette.text.primary};
  }
  `
}
