import { ChangeEvent } from 'react'

import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

interface numberInputProps {
  label: string
  changeFunc: (event: ChangeEvent) => void
  prefix?: string
}
const NumberInput = (props: numberInputProps) => {
  return (
    <>
      <TextField
        label={props.label}
        size='small'
        variant='outlined'
        color='secondary'
        type='number'
        margin='dense'
        onChange={(event: ChangeEvent) => {
          props.changeFunc(event)
        }}
        inputProps={{
          defaultValue: 0,
          step: 0.1,
          min: -1,
          max: 1,
        }}
        InputProps={
          props.prefix
            ? {
                startAdornment: (
                  <InputAdornment position='start'>
                    {props.prefix}
                  </InputAdornment>
                ),
              }
            : {}
        }
      />
    </>
  )
}
export default NumberInput
