import GeneticElement from '@eplant/GeneticElement'
import {
  Box,
  CircularProgress,
  Fade,
  Grow,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import React, { ReactPropTypes, useId, useMemo } from 'react'
import { View, ViewDataError, ViewProps } from '../View'
import { useEFPSVG, useStyles } from './svg'
import {
  EFPAction,
  EFPData,
  EFPGroup,
  EFPId,
  EFPSampleData,
  EFPTissue,
} from './types'
import _ from 'lodash'
import { useViewID } from '@eplant/state'

function SVGTooltip(props: {
  el: SVGElement | null
  group: EFPGroup
  tissue: EFPTissue
  data: EFPData
}) {
  const [open, setOpen] = React.useState(false)
  const theme = useTheme()
  React.useEffect(() => {
    const enterListener = () => {
      setOpen(true)
    }
    const leaveListener = () => {
      setOpen(false)
    }
    if (props.el) {
      props.el.addEventListener('mouseenter', enterListener)
      props.el.addEventListener('mouseleave', leaveListener)
      return () => {
        if (props.el) {
          props.el.removeEventListener('mouseenter', enterListener)
          props.el.removeEventListener('mouseleave', leaveListener)
          setOpen(false)
        }
      }
    }
  }, [props.el])
  return (
    <Popper transition anchorEl={props.el} open={open}>
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={350}>
          <Box
            sx={(theme) => ({
              backgroundColor: theme.palette.background.active,
              padding: theme.spacing(1),
              boxShadow: theme.shadows[2],
            })}
          >
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Sample name</TableCell>
                  <TableCell>{props.tissue.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Level</TableCell>
                  <TableCell>
                    {props.tissue.mean.toFixed(2)}±{props.tissue.std.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Samples</TableCell>
                  <TableCell>{props.tissue.samples}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Log2 of fold change vs control</TableCell>
                  <TableCell>
                    {Math.log2(
                      props.tissue.mean / (props.data.control ?? 1)
                    ).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Grow>
      )}
    </Popper>
  )
}

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
      renderAsThumbnail: false,
      colorMode: 'absolute',
      groups: groupsData,
      control: _.mean(
        groupsData.map((g) => g.control).filter((g) => Number.isFinite(g))
      ),
    }
    return out
  }
  component = (props: ViewProps<EFPData, EFPAction>): JSX.Element => {
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
    const id =
      'svg-container-' +
      this.id +
      '-' +
      (props.geneticElement?.id ?? 'no-gene') +
      '-' +
      React.useMemo(() => Math.random().toString(16).slice(3), [])
    const styles = useStyles(id, props.activeData)
    React.useLayoutEffect(() => {
      const el = document.createElement('style')
      el.innerHTML = styles
      document.head.appendChild(el)
      return () => {
        document.head.removeChild(el)
      }
    }, [props.activeData.groups, styles])

    // Add tooltips to svg
    const [svgElements, setSvgElements] = React.useState<
      {
        el: SVGElement
        group: EFPGroup
        tissue: EFPTissue
      }[]
    >([])

    React.useLayoutEffect(() => {
      const elements = Array.from(
        props.activeData.groups.flatMap((group) =>
          group.tissues.map((t) => ({
            el: document.querySelector(`#${id} .efp-group-${t.id}`),
            group,
            tissue: t,
          }))
        )
      )
      setSvgElements(elements as any)
    }, [props.activeData.groups, id])
    if (!svg) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <CircularProgress />
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
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          id={id}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        {!props.activeData.renderAsThumbnail &&
          svgElements.map(({ el, group, tissue }) => (
            <SVGTooltip
              data={props.activeData}
              key={tissue.id}
              el={el}
              group={group}
              tissue={tissue}
            />
          ))}
      </div>
    )
  }
  header: (props: { geneticElement: GeneticElement | null }) => JSX.Element = ({
    geneticElement,
  }) => {
    return (
      <Typography variant="h6">
        {this.name} for {geneticElement?.id}
      </Typography>
    )
  }
}

function getEFPSampleData(samples: number[]): EFPSampleData {
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
