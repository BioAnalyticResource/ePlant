import GeneticElement from '@eplant/GeneticElement'
import {
  useSetPanes,
  useViewID,
  usePanes,
  useViews,
  useUserViews,
} from '@eplant/state'
import GeneHeader from '@eplant/UI/GeneHeader'
import { Info } from '@mui/icons-material'
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton'
import Button, { ButtonProps } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import _ from 'lodash'
import React from 'react'
import { GeneInfoViewData } from '.'
import { useViewData, View, ViewProps } from '../View'
import { GeneModel } from './GeneModel'

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
  // Can't render anything if there is no feature
  if (!feature) return <></>
  for (
    let i = 0, prevStyle = {}, str = '';
    i < activeData.geneSequence.length;
    i++
  ) {
    let char = activeData.geneSequence[i].toUpperCase()
    let currentStyle: React.CSSProperties = {}

    // Add regions around the three prime utr and five prime utr
    const features: {
      type: string
      start: number
      end: number
      [key: string]: any
    }[] = [...feature.subfeatures]

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
    let found = false
    for (const sf of features) {
      if (sf.start <= pos && pos <= sf.end) {
        if (sf.type.endsWith('UTR')) {
          char = char.toLowerCase()
          currentStyle = { color: theme.palette.error.main }
          found = true
        }
        if (sf.type == 'exon') {
          currentStyle = { color: theme.palette.warning.main }
          found = true
        }
        if (sf.type == 'end-cap') {
          currentStyle = {
            backgroundColor: theme.palette.info.main,
            color: theme.palette.info.contrastText,
          }
          found = true
        }
      }
    }
    if (!found) {
      char = char.toLowerCase()
      currentStyle = {
        color: theme.palette.info.main,
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

export default function ({
  geneticElement,
  activeData,
}: ViewProps<GeneInfoViewData>) {
  if (geneticElement == null) {
    throw new TypeError('Genetic element must be provided for Gene Info View')
  }

  return (
    <Stack direction="row" gap={'20px'}>
      <ViewSwitcher geneticElement={geneticElement} />
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
          <Typography variant="body1">Full name</Typography>
          <SecondaryText>{activeData.name}</SecondaryText>
        </div>
        <div>
          <Typography variant="body1">Brief description</Typography>
          <SecondaryText>{activeData.brief_description}</SecondaryText>
        </div>
        <div>
          <Typography variant="body1">Computational description</Typography>
          <SecondaryText>
            {activeData.computational_description}
          </SecondaryText>{' '}
        </div>
        <div>
          <Typography variant="body1">Curator summary</Typography>
          <SecondaryText>{activeData.curator_summary}</SecondaryText>
        </div>
        <div>
          <Typography variant="body1">Location & Gene model</Typography>
          <div>
            <SecondaryText>
              {activeData.location}: {activeData.chromosome_start} to{' '}
              {activeData.chromosome_end}, Strand {activeData.strand}
            </SecondaryText>
            <div>
              {activeData.features.map((f) => (
                <GeneModel key={f.uniqueID} margin={5} feature={f}></GeneModel>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Typography variant="body1">DNA sequence</Typography>
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
            <Typography variant="body1">Protein sequence</Typography>
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
}
function ViewSwitcher({ geneticElement }: { geneticElement: GeneticElement }) {
  const id = useViewID()
  const setPanes = useSetPanes()
  const views = useViews()
  const userViews = useUserViews()
  return (
    <Stack direction="column" gap={'16px'} flex={1}>
      <div style={{ whiteSpace: 'nowrap' }}>
        <SecondaryText>Available views</SecondaryText>
      </div>
      {userViews.map((view) => (
        <ViewButton
          color="secondary"
          sx={{
            textAlign: 'left',
            justifyContent: 'flex-start',
          }}
          startIcon={view.icon ? <view.icon /> : undefined}
          key={view.name}
          view={view}
          geneticElement={geneticElement}
          onClick={() => switchViews(view)}
        >
          {view.name}
        </ViewButton>
      ))}
    </Stack>
  )

  function switchViews(view: View) {
    setPanes((views) => ({
      ...views,
      [id]: {
        ...views[id],
        view: view.id,
      },
    }))
  }
}

function ViewButton({
  geneticElement,
  view,
  ...props
}: { geneticElement: GeneticElement; view: View } & LoadingButtonProps) {
  const { loading, error, loadingAmount } = useViewData(view, geneticElement)
  return <LoadingButton {...props} loading={loading} disabled={!!error} />
}
