import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import Autocomplete from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { debounce } from 'lodash'
import * as React from 'react'
import { Theme, SxProps } from '@mui/system'

export default function SearchBar(props: {
  complete?: (input: string) => Promise<string[]>
  label?: string
  onSubmit?: (output: string) => void
  placeholder?: string
  sx?: SxProps<Theme>
}) {
  const [value, setValue] = React.useState<string>('')
  const [options, setOptions] = React.useState<string[]>([])
  const updateOptions = React.useRef(
    debounce(async (newValue) => {
      setOptions((await props.complete?.(newValue)) ?? [])
    }, 100)
  )
  const id = React.useId()

  React.useEffect(() => {
    updateOptions.current(value)
  }, [value])

  return (
    <Stack direction="row" spacing={0}>
      <Autocomplete
        onChange={(event, newVal) => setValue(newVal)}
        value={value}
        id={id}
        options={options}
        freeSolo
        disableClearable
        onInputChange={(event, value) => setValue(value)}
        sx={props.sx}
        onKeyUp={(event) => {
          if (event.key == 'Enter') {
            props.onSubmit?.(value)
          }
        }}
        renderInput={(params) => (
          <TextField
            placeholder={props.placeholder}
            label={props.label}
            {...params}
          />
        )}
      />
      <IconButton color="primary" onClick={() => props.onSubmit?.(value)}>
        <SearchIcon />
      </IconButton>
    </Stack>
  )
}
