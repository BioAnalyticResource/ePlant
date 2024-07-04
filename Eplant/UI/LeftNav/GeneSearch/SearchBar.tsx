import { useEffect, useId, useRef, useState } from 'react'
import { debounce } from 'lodash'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { SxProps, Theme } from '@mui/material'
import { Chip, InputAdornment } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import IconButton from '@mui/material/IconButton'
import TextField, { TextFieldProps } from '@mui/material/TextField'
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
  const [value, setValue] = useState<string[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const [options, setOptions] = useState<string[]>([])
  const [focused, setFocused] = useState<boolean>(false)
  const updateOptions = useRef<(text: string) => void>()

  function handleChange(input: string[]) {
    if (input.length > 0) {
      // If input is a comma seperated list, will split into seperate genes
      setValue([...input.slice(0, -1), ...input.slice(-1)[0].split(',')])
    } else {
      setValue(input)
    }
  }

  useEffect(() => {
    updateOptions.current = debounce(async (newValue) => {
      const newoptions = await props.complete?.(newValue)
      setOptions(newoptions?.length ? newoptions : [])
    }, 100)
  }, [props.complete])
  const id = useId()

  useEffect(() => {
    updateOptions.current?.(inputValue)
  }, [inputValue])

  return (
    <Autocomplete
      onChange={(event, newVal) => handleChange(newVal)}
      value={value}
      id={id}
      options={options}
      freeSolo
      multiple
      size='small'
      disableClearable
      onInputChange={(event, value) => setInputValue(value)}
      sx={props.sx}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip
            label={option}
            size='small'
            {...getTagProps({ index })}
            key={index}
            deleteIcon={<CloseIcon />}
          />
        ))
      }
      renderInput={({ InputProps, ...params }) => (
        <TextField
          sx={(theme) => ({
            background: theme.palette.background.paperOverlay,
            borderRadius: 1,
          })}
          placeholder={props.placeholder}
          label={props.label}
          variant='outlined'
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
                position='end'
                sx={{
                  position: 'absolute',
                  right: '4px',
                  bottom: '27px',
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
                  {value.length > 0 ? <AddIcon /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...params}
          size='medium'
        />
      )}
    />
  )
}
