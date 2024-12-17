import styled from '@emotion/styled'
import GeneticElement from '@eplant/GeneticElement'
import { View } from '@eplant/View'
import { useViewData } from '@eplant/View/viewData'
import { Box, Button, ButtonProps, LinearProgress } from '@mui/material'

export const ViewButton = styled(function ViewButton({
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
