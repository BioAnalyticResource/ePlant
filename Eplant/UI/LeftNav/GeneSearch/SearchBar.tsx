import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import Autocomplete from '@mui/material/Autocomplete'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { debounce } from 'lodash'
import * as React from 'react'
import { Theme, SxProps } from '@mui/material'
import { Chip, InputAdornment } from '@mui/material'

/**
 * The search bar in ePlant. Supports async autocomplete and searching for multiple genes at once.
 * @param props.label The label of the search bar
 * @param props.inputProps The props to pass to the input
 * @param props.complete A function that returns a list of suggestions
 * @param props.onSubmit A function that is called when the user submits the search
 * @param props.placeholder The placeholder of the input
 * @param props.sx The style of the search bar
 * @return {*}
 */
export default function SearchBar(props: {
  complete?: (input: string) => Promise<string[]>
  label?: string
  onSubmit?: (output: string[]) => void
  placeholder?: string
  sx?: SxProps<Theme>
  inputProps?: TextFieldProps
}) {
  const [value, setValue] = React.useState<string[]>([])
  const [inputValue, setInputValue] = React.useState<string>('')
  const [options, setOptions] = React.useState<string[]>([])
  const [focused, setFocused] = React.useState<boolean>(false)
  const updateOptions = React.useRef<(text: string) => void>()

  React.useEffect(() => {
    updateOptions.current = debounce(async (newValue) => {
      setOptions((await props.complete?.(newValue)) ?? [])
    }, 100)
  }, [props.complete])
  const id = React.useId()

  React.useEffect(() => {
    updateOptions.current?.(inputValue)
  }, [inputValue])

  return (
    <Autocomplete
      onChange={(event, newVal) => setValue(newVal)}
      value={value}
      id={id}
      options={options}
      freeSolo
      multiple
      size="small"
      disableClearable
      onInputChange={(event, value) => setInputValue(value)}
      sx={props.sx}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip
            label={option}
            size="small"
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      renderInput={({ InputProps, ...params }) => (
        <TextField
          placeholder={props.placeholder}
          label={props.label}
          variant="outlined"
          {...params}
          InputProps={{
            ...InputProps,
            onKeyDown(e) {
              if (e.key === 'Enter') {
                if (inputValue == '') {
                  props.onSubmit?.(value)
                  setValue([])
                }
              }
            },
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{
                  position: 'absolute',
                  right: '4px',
                }}
              >
                <IconButton
                  sx={{
                    color: focused ? 'primary.main' : 'text.secondary',
                  }}
                  onClick={() => {
                    props.onSubmit?.(value)
                    setValue([])
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...params}
        />
      )}
    />
  )
}
