import { mix } from 'color2k'

import { Theme } from '@mui/material'

export const getWorldEFPColour = (theme: Theme, value: number, max: number) => {
  const ratio = value / max
  return mix(
    theme.palette.neutral.main,
    theme.palette.hot.main,
    Math.abs(ratio)
  )
}
