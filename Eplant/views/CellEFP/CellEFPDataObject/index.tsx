import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import _ from 'lodash'

import GeneticElement from '@eplant/GeneticElement'
import { ViewDataError } from '@eplant/View/viewData'
import { CircularProgress, Typography } from '@mui/material'

import { getEFPSampleData } from '../../eFP'
import { useEFPSVG, useStyles } from '../../eFP/svg'
import { EFPData, EFPGroup, EFPTissue } from '../../eFP/types'
import CellEFPTooltip from '../tooltip'
import { CellEFPViewerData } from '../types'

interface CellEFPDataObjectComponentProps {
  geneticElement: GeneticElement | null
  data: CellEFPViewerData
}
interface CellEFPDataObject {
  svgURL: string
  xmlURL: string
  getInitialData: (
    gene: GeneticElement | null,
    loadEvent: (val: number) => void
  ) => Promise<EFPData>
  component: ({
    geneticElement,
    data,
  }: CellEFPDataObjectComponentProps) => JSX.Element
}

export const CellEFPDataObject: CellEFPDataObject = {
  svgURL: 'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.svg',
  xmlURL: 'https://bar.utoronto.ca/eplant/data/cell/Arabidopsis_thaliana.xml',
  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (val: number) => void
  ): Promise<EFPData> {
    if (!gene) throw ViewDataError.UNSUPPORTED_GENE
    const parser = new DOMParser()
    const xml = await fetch(CellEFPDataObject.xmlURL).then(async (res) =>
      parser.parseFromString(await res.text(), 'text/xml')
    )
    const webservice = 'https://bar.utoronto.ca/eplant/cgi-bin/groupsuba4.php'
    const sampleNames: string[] = []

    // Should only be one group
    const groups = Array.from(xml.getElementsByTagName('image')).map(
      (groupData) => {
        const tissues = Array.from(
          groupData.getElementsByTagName('subcellular')
        )
        return {
          name: groupData.getAttribute('id') || '',
          tissues: tissues.map((tissue) => {
            const sample = tissue.getAttribute('sample') || ''
            sampleNames.push(sample)
            return {
              name: tissue.getAttribute('name') || '',
              id: tissue.getAttribute('id') || '',
              samples: [sample],
            }
          }),
        }
      }
    )

    // Fetch sample data by making POST to webservice
    let data: { [key: string]: number } = {}
    const response = await fetch(webservice, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AGI_IDs: gene.id.split(' '),
        include_predicted: true,
      }),
    })

    const jsonResponse: [{ [key: string]: { [key: string]: number } }] =
      await response.json()

    Array.from(jsonResponse).forEach((element) => {
      data = element.data as { [key: string]: number }
    })

    const groupData = groups
      .map((group) => {
        const tissues: EFPTissue[] = group.tissues.map((tissue) => ({
          name: tissue.name,
          id: tissue.id,
          ...getEFPSampleData(
            tissue.samples
              .map((name) => data[name.toLowerCase()] || 0)
              .filter((n) => Number.isFinite(n))
          ),
        }))
        const tissueValues = tissues.map((tissue) => tissue.mean)
        return {
          name: group.name,
          tissues: tissues.filter((t) => t.samples > 0),
          ...getEFPSampleData(tissueValues),
        }
      })
      .filter((g) => Number.isFinite(g.mean))

    const out: EFPData = {
      groups: groupData,
      min: Math.min(...groupData.map((g) => g.min)),
      max: Math.max(...groupData.map((g) => g.max)),
      mean: _.mean(groupData.map((g) => g.mean)),
      std:
        _.sum(groupData.map((g) => g.std ** 2 * g.samples)) /
        _.sum(groupData.map((g) => g.samples)),
      samples: _.sum(groupData.map((g) => g.samples)),
      supported:
        Number.isFinite(_.mean(groupData.map((g) => g.mean))) &&
        groupData.length > 0,
    }
    return out
  },
  component({ geneticElement, data }: CellEFPDataObjectComponentProps) {
    const { view } = useEFPSVG(
      {
        svgURL: CellEFPDataObject.svgURL,
        xmlURL: CellEFPDataObject.xmlURL,
        id: 'Cell-EFP',
      },
      {
        showText: true,
      }
    )
    const { svg } = view ?? {}
    const id =
      'svg-container-' +
      'Cell-EFP' +
      '-' +
      (geneticElement?.id ?? 'no-gene') +
      '-' +
      useMemo(() => Math.random().toString(16).slice(3), [])
    const styles = useStyles(id, data.viewData, 'absolute')
    useEffect(() => {
      const el = document.createElement('style')
      el.innerHTML = styles
      document.head.appendChild(el)
      return () => {
        document.head.removeChild(el)
      }
    }, [data.viewData.groups, styles])
    // Add tooltips to svg
    const [svgElements, setSvgElements] = useState<
      {
        el: SVGElement
        group: EFPGroup
        tissue: EFPTissue
      }[]
    >([])
    const svgDiv = useMemo(() => {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
          }}
          id={id}
          dangerouslySetInnerHTML={{ __html: svg ?? '' }}
        />
      )
    }, [svg, id])

    useLayoutEffect(() => {
      const elements = Array.from(
        data.viewData.groups.flatMap((group) =>
          group.tissues.map((t) => ({
            el: document.querySelector(`#${id} .efp-group-${t.id}`),
            group,
            tissue: t,
          }))
        )
      )
      setSvgElements(elements as any)
    }, [data.viewData.groups, id, svgDiv])
    if (!svg) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </div>
      )
    }
    if (!data.viewData.supported) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>N/A</Typography>
        </div>
      )
    }
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'center',
          flexDirection: 'column',
        }}
      >
        {svgDiv}
        {svgElements.map(({ el, group, tissue }) => (
          <CellEFPTooltip
            data={data.viewData}
            key={tissue.id}
            el={el}
            group={group}
            tissue={tissue}
          />
        ))}
      </div>
    )
  },
}
