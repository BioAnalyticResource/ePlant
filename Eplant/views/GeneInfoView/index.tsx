import { Container, Stack, Table, TableHead, Typography } from '@mui/material'
import * as React from 'react'
import { z } from 'zod'
import { View, ViewProps } from '../View'
import { styled, ThemeProvider, useTheme } from '@mui/material/styles'
import TableBody from '@mui/material/TableBody'
import { GeneModel } from './GeneModel'
import GeneticElement from '@eplant/GeneticElement'
import _ from 'lodash'

export const GeneFeature: z.ZodType = z.object({
  type: z.enum([
    'exon',
    'CDS',
    'five_prime_UTR',
    'three_prime_UTR',
    'gene',
    'mRNA',
  ]),
  uniqueID: z.string(),
  start: z.number().int(),
  end: z.number().int(),
  subfeatures: z.lazy(() => GeneFeature).array(),
  strand: z.string(),
})
export type GeneFeature = z.infer<typeof GeneFeature>

export const GeneInfoViewData = z
  .object({
    name: z.string(),
    brief_description: z.string(),
    computational_description: z.string(),
    curator_summary: z.string(),
    location: z.string(),
    chromosome_start: z.number(),
    chromosome_end: z.number(),
    strand: z.string(),
    geneSequence: z.string(),
    geneticElementType: z.enum([
      'protein_coding',
      'novel_transcribed_region',
      'non_coding',
    ]),
    features: GeneFeature.array(),
    proteinSequence: z.string().optional(),
  })
  .refine(
    (obj) => obj.geneticElementType != 'protein_coding' || obj.proteinSequence,
    (obj) => ({
      message: `proteinSequence must be defined if it is a protein_coding gene`,
    })
  )
export type GeneInfoViewData = z.infer<typeof GeneInfoViewData>

const SecondaryText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))
const CodeBody = styled(SecondaryText)(({ theme }) => ({
  fontFamily: 'Roboto Mono',
  wordBreak: 'break-word',
}))

const GeneSequence = ({
  activeData,
  geneticElement,
}: {
  activeData: GeneInfoViewData
  geneticElement: GeneticElement
}) => {
  const theme = useTheme()
  const spans = []
  const feature = activeData.features.find(
    (sf) => sf.uniqueID == geneticElement.id + '.1'
  )
  for (
    let i = 0, prevStyle = {}, str = '';
    i < activeData.geneSequence.length;
    i++
  ) {
    let char = activeData.geneSequence[i].toUpperCase()
    const currentStyle: React.CSSProperties = {}

    // Add regions around the three prime utr and five prime utr
    const features = [...feature.subfeatures]

    features
      .filter(
        (sf: any) => sf.type == 'five_prime_UTR' || sf.type == 'three_prime_UTR'
      )
      .map((a: any) => {
        if (
          (a.type == 'three_prime_UTR' && a.strand == '1') ||
          (a.type == 'five_prime_UTR' && a.strand != '1')
        )
          features.push({
            type: 'end-cap',
            start: a.start - 3,
            end: a.start - 1,
          })
        else
          features.push({
            type: 'end-cap',
            start: a.end + 1,
            end: a.end + 3,
          })
      })

    // Add styles for each feature that includes this char
    const pos = i + activeData.chromosome_start
    for (const sf of features) {
      if (sf.start <= pos && pos <= sf.end) {
        if (sf.type.endsWith('UTR')) {
          char = char.toLowerCase()
          currentStyle.color = theme.palette.text.disabled
        }
        if (sf.type == 'exon') {
          currentStyle.color = theme.palette.primary.dark
        }
        if (sf.type == 'CDS') {
          currentStyle.backgroundColor = theme.palette.secondary.main
        }
        if (sf.type == 'end-cap') {
          currentStyle.backgroundColor = theme.palette.primary.main
          currentStyle.color = theme.palette.primary.contrastText
        }
      }
    }

    // Push a new span whenever the styles change and at the end of the loop
    if (
      !_.isEqual(prevStyle, currentStyle) ||
      i == activeData.geneSequence.length - 1
    ) {
      spans.push(
        <span style={prevStyle} key={spans.length}>
          {str}
        </span>
      )
      str = ''
    }
    str += char
    prevStyle = currentStyle
  }
  return <CodeBody variant="caption">{spans}</CodeBody>
}

export const GeneInfoView = {
  name: 'Gene Info Viewer',
  dataType: GeneInfoViewData,
  component({ geneticElement, activeData }: ViewProps<GeneInfoViewData>) {
    return (
      <Stack direction="row" gap={'20px'}>
        <Stack direction="column" gap={'16px'} flex={1}>
          <div style={{ whiteSpace: 'nowrap' }}>
            <Typography variant="body1">Available views</Typography>
          </div>
          {geneticElement.views.map((view) => (
            <div key={view.name}>{view.name}</div>
          ))}
        </Stack>

        <Stack
          direction="column"
          gap={'16px'}
          flex={4}
          data-testid="gene-info-stack"
        >
          <div>
            <Typography variant="body1">Gene</Typography>
            <SecondaryText>{geneticElement.id}</SecondaryText>
          </div>
          <div>
            <Typography variant="body1">Aliases</Typography>
            <SecondaryText>{geneticElement.aliases.join(', ')}</SecondaryText>
          </div>
          <div>
            <Typography variant="body1">Full Name</Typography>
            <SecondaryText>{activeData.name}</SecondaryText>
          </div>
          <div>
            <Typography variant="body1">Brief Description</Typography>
            <SecondaryText>{activeData.brief_description}</SecondaryText>
          </div>
          <div>
            <Typography variant="body1">Computational Description</Typography>
            <SecondaryText>
              {activeData.computational_description}
            </SecondaryText>{' '}
          </div>
          <div>
            <Typography variant="body1">Curator Summary</Typography>
            <SecondaryText>{activeData.curator_summary}</SecondaryText>
          </div>
          <div>
            <Typography variant="body1">Location & Gene Model</Typography>
            <div>
              <SecondaryText>
                {activeData.location}: {activeData.chromosome_start} to{' '}
                {activeData.chromosome_end}, Strand {activeData.strand}
              </SecondaryText>
              <div>
                {activeData.features.map((f) => (
                  <GeneModel
                    key={f.uniqueID}
                    margin={5}
                    feature={f}
                  ></GeneModel>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Typography variant="body1">DNA Sequence</Typography>
            <div>
              <div>
                <SecondaryText variant="caption" whiteSpace={'nowrap'}>
                  {'> ' + geneticElement.id}
                </SecondaryText>
              </div>
              <div>
                <GeneSequence
                  geneticElement={geneticElement}
                  activeData={activeData}
                ></GeneSequence>
              </div>
            </div>
          </div>
          {activeData.geneticElementType == 'protein_coding' ? (
            <div>
              <Typography variant="body1">Protein Sequence</Typography>
              <div>
                <SecondaryText variant="caption" whiteSpace={'nowrap'}>
                  {'> ' + geneticElement.id}
                </SecondaryText>
              </div>
              <div>
                <CodeBody variant="caption" style={{ wordBreak: 'break-word' }}>
                  {activeData.proteinSequence}
                </CodeBody>
              </div>
            </div>
          ) : undefined}
        </Stack>
      </Stack>
    )
  },
}
