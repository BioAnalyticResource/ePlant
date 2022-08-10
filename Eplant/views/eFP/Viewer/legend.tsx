import React from 'react'
import { Box, styled, useTheme } from '@mui/material'
import { EFPData } from '../types'
import { getColor } from '../svg'
import useDimensions from '@eplant/util/useDimensions'

const GRADIENT_STEPS = 11
export default styled(function Legend({ data, ...rest }: { data: EFPData }) {
  const theme = useTheme()
  const control = data.control ?? 1
  const values = Array(GRADIENT_STEPS)
    .fill(0)
    .map((_, i) => {
      const ratio = i / (GRADIENT_STEPS - 1)
      if (data.colorMode == 'relative') {
        const extremum = Math.max(
          Math.abs(Math.log2(data.min / control)),
          Math.log2(data.max / control),
          1
        )
        const [lo, hi] = [-extremum, extremum]
        const val = lo + (hi - lo) * ratio
        return val
      }
      const [lo, hi] = [0, data.max]
      const val = ratio * (hi - lo) + lo
      return val
    })

  const gradient = values
    .map((g) =>
      getColor(
        data.colorMode == 'absolute' ? g : 2 ** g * control,
        data,
        data.control ?? 1,
        theme,
        data.colorMode
      )
    )
    .map((color, i) => (
      <Box
        key={i}
        sx={{
          width: '15px',
          height: '15px',
          backgroundColor: color,
          display: 'inline-block',
        }}
      ></Box>
    ))

  return (
    <Box
      {...rest}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: theme.spacing(2),
      })}
    >
      {values[0].toFixed(2)}
      <div style={{ alignItems: 'center', display: 'flex' }}>{gradient}</div>
      {values[values.length - 1].toFixed(2)}
    </Box>
  )
})()
