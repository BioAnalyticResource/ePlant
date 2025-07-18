import { useState } from 'react'
import _ from 'lodash'
import { useOutletContext } from 'react-router-dom'

import { useConfig } from '@eplant/config'
import GeneticElement from '@eplant/GeneticElement'
import { useSetActiveViewId } from '@eplant/state'
import LoadingPage from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Alert, Box, IconButton, Snackbar } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'

import { ViewDataError, ViewMetadata } from '../../View'

import { CodeBody } from './CodeBody'
import { GeneModel } from './GeneModel'
import { GeneSequence } from './GeneSequence'
import { geneInfoLoader } from './loader'
import { SecondaryText } from './SecondaryText'
import { GeneInfoViewData } from './types'
import { ViewButton } from './ViewButton'
import GeneInfoViewMetadata from '.'

export const GeneInfoView = () => {
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const { geneticElement } = useOutletContext<ViewContext>()
  const [loadAmount, setLoadAmount] = useState(0)
  const { data, isLoading, isError, error } = useQuery<
    GeneInfoViewData,
    ViewDataError
  >({
    queryKey: [`geneInfo-${geneticElement?.id}`],
    queryFn: async () => {
      return geneInfoLoader(geneticElement, setLoadAmount)
    },
    retry: false,
  })
  const copyToClipboard = (text: string) => {
    setSnackBarOpen(true)
    navigator.clipboard.writeText(text)
  }

  if (!geneticElement) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={GeneInfoViewMetadata}
        error={ViewDataError.UNSUPPORTED_GENE}
      ></LoadingPage>
    )
  } else if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={GeneInfoViewMetadata}
        error={error}
      ></LoadingPage>
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={GeneInfoViewMetadata}
        error={null}
      ></LoadingPage>
    )
  } else if (!data) return <></>

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
            {geneticElement?.id}
          </Typography>
          <SecondaryText>{geneticElement?.aliases.join(', ')}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Full name</Typography>
          <SecondaryText>{data.name}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Brief description</Typography>
          <SecondaryText>{data.brief_description}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Computational description</Typography>
          <SecondaryText>{data.computational_description}</SecondaryText>{' '}
        </div>
        <div>
          <Typography variant='body1'>Curator summary</Typography>
          <SecondaryText>{data.curator_summary}</SecondaryText>
        </div>
        <div>
          <Typography variant='body1'>Location & Gene model</Typography>
          <div>
            <SecondaryText>
              {data.location}: {data.chromosome_start} to {data.chromosome_end},
              Strand {data.strand}
            </SecondaryText>
            <div>
              {data.features.map((f) => (
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
                {'> ' + geneticElement?.id}
              </SecondaryText>
            </div>
            <div>
              <GeneSequence
                geneticElement={geneticElement}
                activeData={data}
              ></GeneSequence>
              <IconButton
                onClick={() => copyToClipboard(data.geneSequence)}
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
        {data.geneticElementType == 'protein_coding' ? (
          <div>
            <Typography variant='body1'>Protein sequence</Typography>
            <div>
              <SecondaryText variant='caption' whiteSpace={'nowrap'}>
                {'> ' + geneticElement?.id}
              </SecondaryText>
            </div>
            <div>
              <CodeBody variant='caption' style={{ wordBreak: 'break-word' }}>
                {data.proteinSequence}
              </CodeBody>
              <IconButton
                onClick={() => {
                  if (data.proteinSequence) {
                    copyToClipboard(data.proteinSequence)
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
function ViewSwitcher({
  geneticElement,
}: {
  geneticElement: GeneticElement | null
}) {
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

  function switchViews(view: ViewMetadata) {
    setActiveViewId(view.id)
  }
}
