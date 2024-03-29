import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import _ from 'lodash'

import GeneticElement from '@eplant/GeneticElement'
import { View, ViewProps } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'
import { CircularProgress, Typography } from '@mui/material'

import SVGTooltip from './Viewer/EFPTooltip'
import { useEFPSVG, useStyles } from './svg'
import {
  EFPAction,
  EFPData,
  EFPGroup,
  EFPId,
  EFPSampleData,
  EFPState,
  EFPTissue,
} from './types'

interface efpTooptipProps {
  el: SVGElement | null
  group: EFPGroup
  tissue: EFPTissue
  data: EFPData
  state: EFPState
}
export default class EFP implements View<EFPData, EFPState, EFPAction> {
  getInitialState: () => EFPState = () => ({
    colorMode: 'absolute',
    renderAsThumbnail: false,
    maskThreshold: 100,
    maskingEnabled: false,
  })
  tooltipComponent: ({
    el,
    group,
    tissue,
    data,
    state,
  }: efpTooptipProps) => JSX.Element
  constructor(
    public name: string,
    public id: EFPId,
    public svgURL: string,
    public xmlURL: string
  ) {
    this.component = this.component.bind(this)
    this.tooltipComponent = SVGTooltip
  }
  //TODO: Reimplement this once the new BAR API is ready
  getInitialData = async (
    gene: GeneticElement | null,
    loadEvent: (val: number) => void
  ): Promise<EFPData> => {
    if (!gene) throw ViewDataError.UNSUPPORTED_GENE
    const parser = new DOMParser()
    const xml = await fetch(this.xmlURL).then(async (res) =>
      parser.parseFromString(await res.text(), 'text/xml')
    )
    // Get the url for the api request
    const database = xml.getElementsByTagName('view')[0]?.getAttribute('db')
    let webservice = xml.getElementsByTagName('webservice')[0]?.textContent
    if (!webservice)
      webservice = `https://bar.utoronto.ca/eplant/cgi-bin/plantefp.cgi?datasource=${
        database ?? 'atgenexp_plus'
      }&`

    // Get a list of groups and samples
    const sampleNames: string[] = []
    const groups = Array.from(xml.getElementsByTagName('group')).map(
      (group) => {
        const tissues = Array.from(group.getElementsByTagName('tissue'))
        const controls = Array.from(group.getElementsByTagName('control')).map(
          (a) => a.getAttribute('sample') as string
        )
        sampleNames.push(...controls)
        return {
          name: group.getAttribute('name') as string,
          controls,
          tissues: tissues.map((tissue) => {
            return {
              name: tissue.getAttribute('name') as string,
              id: tissue.getAttribute('id') as string,
              samples: Array.from(tissue.getElementsByTagName('sample')).map(
                (a) => {
                  const name = a.getAttribute('name') as string
                  sampleNames.push(name)
                  return name
                }
              ),
            }
          }),
        }
      }
    )

    loadEvent(0.2)
    const samples: { [key: string]: number } = {}
    // Fetch the sample names in chunks to give a more accurate progress bar
    const chunks = _.chunk(sampleNames, 20)
    let loaded = 0.2
    const loadStep = (1 - loaded) / chunks.length
    const data = (
      await Promise.all(
        chunks.map((names) =>
          fetch(
            webservice +
              `id=${gene.id}&samples=${encodeURIComponent(
                JSON.stringify(names)
              )}`
          )
            .then((res) => res.json())
            .then(
              (samples) =>
                samples
                  .filter(
                    (sample: any) => sample && !isNaN(parseFloat(sample.value))
                  )
                  .map((sample: any) => ({
                    name: sample.name,
                    value: parseFloat(sample.value),
                  })) as { value: number; name: string }[]
            )
            .then((samples) => {
              loaded += loadStep
              loadEvent(loaded)
              return samples
            })
        )
      )
    ).flat()

    for (const { name, value } of data) samples[name] = value
    loadEvent(1)
    const groupsData = groups
      .map((group) => {
        const tissues: EFPTissue[] = group.tissues.map((tissue) => ({
          name: tissue.name,
          id: tissue.id,
          ...getEFPSampleData(
            tissue.samples
              .map((name) => samples[name])
              .filter((n) => Number.isFinite(n))
          ),
        }))
        const tissueValues = tissues.map((tissue) => tissue.mean)
        const control = _.mean(
          group.controls
            .map((control) => samples[control])
            .filter((n) => Number.isFinite(n))
        )
        return {
          name: group.name,
          control: Number.isFinite(control) ? control : undefined,
          tissues: tissues.filter((t) => t.samples > 0),
          ...getEFPSampleData(tissueValues),
        }
      })
      .filter((g) => Number.isFinite(g.mean))
    const out: EFPData = {
      groups: groupsData,
      control: _.mean(
        groupsData.map((g) => g.control).filter((g) => Number.isFinite(g))
      ),
      min: Math.min(...groupsData.map((g) => g.min)),
      max: Math.max(...groupsData.map((g) => g.max)),
      mean: _.mean(groupsData.map((g) => g.mean)),
      std:
        _.sum(groupsData.map((g) => g.std ** 2 * g.samples)) /
        _.sum(groupsData.map((g) => g.samples)),
      samples: _.sum(groupsData.map((g) => g.samples)),
      supported:
        Number.isFinite(_.mean(groupsData.map((g) => g.mean))) &&
        groupsData.length > 0,
    }
    return out
  }
  component({
    state,
    geneticElement,
    activeData,
  }: ViewProps<EFPData, EFPState, EFPAction>): JSX.Element {
    const { view } = useEFPSVG(
      {
        svgURL: this.svgURL,
        xmlURL: this.xmlURL,
        id: this.id,
      },
      {
        showText: !state.renderAsThumbnail,
      }
    )
    const { svg } = view ?? {}
    const id =
      'svg-container-' +
      this.id +
      '-' +
      (geneticElement?.id ?? 'no-gene') +
      '-' +
      useMemo(() => Math.random().toString(16).slice(3), [])
    const styles = useStyles(
      id,
      activeData,
      state.colorMode,
      state.maskThreshold,
      state.maskingEnabled
    )
    useEffect(() => {
      const el = document.createElement('style')
      el.innerHTML = styles
      document.head.appendChild(el)
      return () => {
        document.head.removeChild(el)
      }
    }, [activeData.groups, styles])

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
        activeData.groups.flatMap((group) =>
          group.tissues.map((t) => ({
            el: document.querySelector(`#${id} .efp-group-${t.id}`),
            group,
            tissue: t,
          }))
        )
      )
      setSvgElements(elements as any)
    }, [activeData.groups, id, svgDiv])
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
    if (!activeData.supported) {
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
        {!state.renderAsThumbnail &&
          svgElements.map(({ el, group, tissue }) => (
            <this.tooltipComponent
              data={activeData}
              key={tissue.id}
              el={el}
              group={group}
              tissue={tissue}
              state={state}
            />
          ))}
      </div>
    )
  }
}

export function getEFPSampleData(samples: number[]): EFPSampleData {
  const mean = _.mean(samples)
  return {
    max: Math.max(...samples),
    min: Math.min(...samples),
    mean: mean,
    std: Math.sqrt(
      _.sumBy(samples, (v) => Math.pow(v - mean, 2)) / samples.length
    ),
    samples: samples.length,
  }
}
