import { useState } from 'react'
import _ from 'lodash'

import { useConfig } from '@eplant/config'
import GeneticElement from '@eplant/GeneticElement'
import { useSetActiveViewId } from '@eplant/state'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Alert, Box, IconButton, Snackbar } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { View, ViewProps } from '../../View'

import { CodeBody } from './CodeBody'
import { GeneModel } from './GeneModel'
import { GeneSequence } from './GeneSequence'
import { SecondaryText } from './SecondaryText'
import {
  GeneInfoViewAction,
  GeneInfoViewData,
  GeneInfoViewState,
} from './types'
import { ViewButton } from './ViewButton'

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
