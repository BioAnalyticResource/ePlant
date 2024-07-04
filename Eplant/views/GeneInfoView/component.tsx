import { CSSProperties, useState } from 'react'
import _ from 'lodash'

import { useConfig } from '@eplant/config'
import GeneticElement from '@eplant/GeneticElement'
import { useSetActiveViewId } from '@eplant/state'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  Alert,
  Box,
  Button,
  ButtonProps,
  IconButton,
  LinearProgress,
  Snackbar,
} from '@mui/material'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { View, ViewProps } from '../../View'
import { useViewData } from '../../View/viewData'

import { GeneModel } from './GeneModel'
import {
  GeneInfoViewAction,
  GeneInfoViewData,
  GeneInfoViewState,
} from './types'

const SecondaryText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))
const CodeBody = styled(SecondaryText)(({ theme }) => ({
  fontFamily: 'Roboto Mono',
  wordBreak: 'break-word',
  fontSize: '.65rem',
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
    let char = (activeData.geneSequence[i] as string).toUpperCase()
    let currentStyle: CSSProperties = {}

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
  return (
    <>
      <CodeBody variant='caption'>{spans}</CodeBody>
    </>
  )
}

const ViewButton = styled(function ViewButton({
  geneticElement,
  view,
  ...props
}: { geneticElement: GeneticElement; view: View } & ButtonProps) {
  const { loading, error, loadingAmount, activeData } = useViewData(
    view,
    geneticElement
  )
  return (
    <Button {...props} disabled={!!error || activeData === undefined}>
      <LinearProgress
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 0,
          opacity: loading ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
          background: 'transparent',
          '.MuiLinearProgress-bar': {
            background: theme.palette.background.hover,
            // Round both corners on the right side
            borderRadius: '0px 0.5rem 0.5rem 0px',
          },
        })}
        value={loadingAmount * 100}
        variant='determinate'
      />
      <Box
        sx={{
          zIndex: 2,
        }}
      >
        {props.children}
      </Box>
    </Button>
  )
})({
  position: 'relative',
  overflow: 'hidden',
})

export default function GeneInfoViewer({
  geneticElement,
  activeData,
}: ViewProps<GeneInfoViewData, GeneInfoViewState, GeneInfoViewAction>) {
  if (geneticElement == null) {
    throw new TypeError('Genetic element must be provided for Gene Info View')
  }

  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const copyToClipboard = (text: string) => {
    setSnackBarOpen(true)
    navigator.clipboard.writeText(text)
  }

  return (
    <Stack direction='row' gap={'20px'}>
      <ViewSwitcher geneticElement={geneticElement} />
      <Stack
        direction='column'
        gap={'16px'}
        flex={4}
        sx={{
          background: (theme) => theme.palette.background.paperOverlay,
          padding: 2,
          borderRadius: (theme) => theme.shape.borderRadius + 'px',
          border: '1px solid',
          borderColor: (theme) => theme.palette.background.edgeLight,
        }}
      >
        <div>
          <Typography variant='h5' sx={{ fontWeight: 500 }}>
            {geneticElement.id}
          </Typography>
          <SecondaryText>{geneticElement.aliases.join(', ')}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Full name</Typography>
          <SecondaryText>{activeData.name}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Brief description</Typography>
          <SecondaryText>{activeData.brief_description}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Computational description</Typography>
          <SecondaryText>
            {activeData.computational_description}
          </SecondaryText>{' '}
        </div>
        <div>
          <Typography variant='body1'>Curator summary</Typography>
          <SecondaryText>{activeData.curator_summary}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Location & Gene model</Typography>
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
          <Typography variant='body1'>DNA sequence</Typography>
          <div>
            <div>
              <SecondaryText variant='caption' whiteSpace={'nowrap'}>
                {'> ' + geneticElement.id}
              </SecondaryText>
            </div>
            <div>
              <GeneSequence
                geneticElement={geneticElement}
                activeData={activeData}
              ></GeneSequence>
              <IconButton
                onClick={() => copyToClipboard(activeData.geneSequence)}
                color='secondary'
                sx={{ ml: 1 }}
              >
                <ContentCopyIcon />
              </IconButton>
              <Snackbar
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={snackBarOpen}
                onClose={() => setSnackBarOpen(false)}
                autoHideDuration={2000}
              >
                <Alert severity='success'>Copied to clipboard!</Alert>
              </Snackbar>
            </div>
          </div>
        </div>
        {activeData.geneticElementType == 'protein_coding' ? (
          <div>
            <Typography variant='body1'>Protein sequence</Typography>
            <div>
              <SecondaryText variant='caption' whiteSpace={'nowrap'}>
                {'> ' + geneticElement.id}
              </SecondaryText>
            </div>
            <div>
              <CodeBody variant='caption' style={{ wordBreak: 'break-word' }}>
                {activeData.proteinSequence}
              </CodeBody>
              <IconButton
                onClick={() => {
                  if (activeData.proteinSequence) {
                    copyToClipboard(activeData.proteinSequence)
                  }
                }}
                color='secondary'
                sx={{ ml: 1 }}
              >
                <ContentCopyIcon />
              </IconButton>
            </div>
          </div>
        ) : undefined}
      </Stack>
    </Stack>
  )
}
function ViewSwitcher({ geneticElement }: { geneticElement: GeneticElement }) {
  const setActiveViewId = useSetActiveViewId()
  const { userViews } = useConfig()
  return (
    <Stack sx={{ marginTop: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: 0,
          position: 'sticky',
          top: '8px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <Typography variant='body2' color='secondary'>
          Available views
        </Typography>
        {userViews.map((view) => (
          <ViewButton
            color='secondary'
            sx={{
              textAlign: 'left',
              justifyContent: 'flex-start',
              color: 'secondary.contrastText',
              textTransform: 'none',
              fontWeight: 'regular',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.primary.dark,
              },
            }}
            startIcon={
              view.icon ? (
                <div
                  style={{
                    transform: 'scale(1.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    paddingLeft: 8,
                    paddingRight: 8,
                  }}
                >
                  <view.icon />
                </div>
              ) : undefined
            }
            key={view.name}
            view={view}
            geneticElement={geneticElement}
            onClick={() => switchViews(view)}
          >
            {view.name}
          </ViewButton>
        ))}
      </Box>
    </Stack>
  )

  function switchViews(view: View) {
    setActiveViewId(view.id)
  }
}
