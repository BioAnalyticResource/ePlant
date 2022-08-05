import GeneticElement from '@eplant/GeneticElement'
import { CircularProgress } from '@mui/material'
import React from 'react'
import { View, ViewDataError, ViewProps } from '../View'
import { useEFPSVG, useStyles } from './svg'
import { EFPData, EFPId } from './types'
import _ from 'lodash'
import { useViewID } from '@eplant/state'
export default class EFP implements View {
  constructor(
    public name: string,
    public id: EFPId,
    public svgURL: string,
    public xmlURL: string
  ) {}
  //TODO: Reimplement this once the new BAR API is ready
  getInitialData = async (
    gene: GeneticElement | null,
    loadEvent: (val: number) => void
  ): Promise<EFPData> => {
    if (!gene) throw ViewDataError.UNSUPPORTED_GENE
    const parser = new DOMParser()
    console.log(this)
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

    loadEvent(0.5)
    const samples: { [key: string]: number } = {}
    const data = (
      await (
        await fetch(
          webservice + `id=${gene.id}&samples=${JSON.stringify(sampleNames)}`
        )
      ).json()
    )
      .filter((sample: any) => sample && !isNaN(parseFloat(sample.value)))
      .map((sample: any) => ({
        name: sample.name,
        value: parseFloat(sample.value),
      })) as { value: number; name: string }[]
    for (const { name, value } of data) samples[name] = value
    loadEvent(1)
    console.log(groups, data)
    const out: EFPData = {
      renderAsThumbnail: false,
      groups: groups.map((group) => {
        const tissues = group.tissues.map((tissue) => ({
          name: tissue.name,
          id: tissue.id,
          value: _.mean(tissue.samples.map((sample) => samples[sample])),
        }))
        const tissueValues = tissues.map((tissue) => tissue.value)
        const mean = _.mean(tissueValues)
        return {
          name: group.name,
          control: _.mean(group.controls.map((control) => samples[control])),
          tissues,
          mean: mean,
          max: Math.max(...tissueValues),
          min: Math.min(...tissueValues),
          std: Math.sqrt(
            _.sumBy(tissueValues, (v) => Math.pow(v - mean, 2)) /
              tissueValues.length
          ),
        }
      }),
    }
    return out
  }
  component = (props: ViewProps<EFPData>): JSX.Element => {
    const { view, loading } = useEFPSVG(
      {
        svgURL: this.svgURL,
        xmlURL: this.xmlURL,
        id: this.id,
      },
      {
        showText: !props.activeData.renderAsThumbnail,
      }
    )

    const { svg } = view ?? {}
    const id = useViewID()
    const styles = useStyles('svg-container-' + id, props.activeData.groups)
    React.useInsertionEffect(() => {
      const el = document.createElement('style')
      el.innerHTML = styles
      document.head.appendChild(el)
      return () => {
        document.head.removeChild(el)
      }
    }, [props.activeData.groups, styles])

    if (!svg) return <CircularProgress />
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
        className={`svg-container-${id}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }
}
