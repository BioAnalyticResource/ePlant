import * as React from 'react'
import PanZoom from '@eplant/util/PanZoom'
import { ComponentMeta } from '@storybook/react'
import { Box } from '@mui/material'

export const Default = () => (
  <PanZoom
    sx={{
      width: '100px',
      height: '100px',
      backgroundColor: 'green',
    }}
  >
    <Box
      sx={{
        width: '50px',
        height: '50px',
        backgroundColor: 'red',
      }}
    ></Box>
  </PanZoom>
)

export default {
  title: 'PanZoom',
  component: PanZoom,
} as ComponentMeta<typeof PanZoom>
