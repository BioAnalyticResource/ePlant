import { Box, styled, useTheme } from '@mui/material'

import { getColor } from '../svg'
import { ColorMode, EFPData, EFPState } from '../types'

interface ILegendProps {
  data: EFPData
  colorMode: ColorMode
  maskingEnabled?: boolean
  maskThreshold?: number
}
const GRADIENT_STEPS = 11
export default styled(function Legend({
  data,
  colorMode,
  maskingEnabled,
  maskThreshold,
  ...rest
}: ILegendProps) {
  const theme = useTheme()
  const control = data.control ?? 1
  const values = Array(GRADIENT_STEPS)
    .fill(0)
    .map((_, i) => {
      const ratio = i / (GRADIENT_STEPS - 1)
      if (colorMode == 'relative') {
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
    .reverse()
    .map((g) =>
      getColor(
        colorMode === 'absolute' ? g : 2 ** g * control,
        data,
        data.control ?? 1,
        theme,
        colorMode
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
        alignItems: 'stretch',
        gap: theme.spacing(1),
      })}
    >
      <Box
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {gradient}
        {maskThreshold && maskingEnabled ? (
          <Box
            sx={{
              width: '15px',
              height: '15px',
              backgroundColor: 'gray',
              display: 'inline-block',
              fontSize: 10,
            }}
          ></Box>
        ) : (
          <></>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {values.map((value) => {
          return (
            <Box key={value} sx={{ fontSize: 10 }}>
              {value.toFixed(2)}
            </Box>
          )
        })}
        {maskThreshold && maskingEnabled ? (
          <Box sx={{ fontSize: 10 }}>{`Masked (≥${maskThreshold}% RSE)`}</Box>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  )
})()
