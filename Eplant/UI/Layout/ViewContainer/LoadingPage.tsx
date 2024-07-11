import { SVGProps } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/View'
import { ViewDataError } from '@eplant/View/viewData'
import { Player } from '@lottiefiles/react-lottie-player'
import { Box, LinearProgress, Stack, Typography, useTheme } from '@mui/material'

import LoadingAnimation from '../../../../thumbnails/loading-page-lottie-animation.json'
import FailedToLoad from '../FailedToLoad'
import NotSupported from '../ViewNotSupported'
/**
 * The lottie animation shown while a genetic element is loading. It looks like a plant being watered by a watering can
 * @param props Props are passed directly to the SVG element
 * @returns
 */
export function LoadingImage(props: SVGProps<SVGSVGElement>) {
  return (
    <Player
      autoplay
      loop
      src={LoadingAnimation}
      style={{ height: '240px', width: '240px' }}
    ></Player>
  )
}

/**
 * The loading page for a view
 * @param props.loadingAmount The proportion that has already loaded
 * @param props.gene The gene for which the view is being loaded
 * @param props.view The view that is being loaded
 * @returns
 */

export default function LoadingPage(props: {
  loadingAmount: number
  gene: GeneticElement | null
  view: View
  error: ViewDataError | null
}) {
  const theme = useTheme()
  if (props.error == ViewDataError.UNSUPPORTED_GENE)
    return <NotSupported geneticElement={props.gene} view={props.view} />
  if (props.error == ViewDataError.FAILED_TO_LOAD)
    return <FailedToLoad geneticElement={props.gene} view={props.view} />
  return (
    <Stack gap={4}>
      <LinearProgress variant='determinate' value={props.loadingAmount * 100} />
      <Box
        display='flex'
        alignItems={'center'}
        justifyContent={'center'}
        marginTop={'150px'}
      >
        <LoadingImage
          style={{
            marginTop: '80px',
            maxWidth: '100%',
            maxHeight: '300px',
          }}
        />
      </Box>
      <Typography align='center'>
        Loading{' '}
        {props.gene
          ? props.gene.id + ' data for ' + props.view.name
          : 'data for ' + props.view.name}
      </Typography>
    </Stack>
  )
}
