import styled from '@emotion/styled'
import GeneticElement from '@eplant/GeneticElement'
import { ViewMetadata } from '@eplant/View'
import { Box, Button, ButtonProps, LinearProgress } from '@mui/material'

export const ViewButton = styled(function ViewButton({
  geneticElement,
  view,
  ...props
}: {
  geneticElement: GeneticElement | null
  view: ViewMetadata
} & ButtonProps) {
  return (
    <Button {...props}>
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
