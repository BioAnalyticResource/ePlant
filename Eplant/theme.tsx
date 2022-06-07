import { createTheme, ThemeOptions } from '@mui/material'

export const light: ThemeOptions = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#99CC00',
    },
  },
})

export const dark: ThemeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#99CC00',
    },
    secondary: {
      main: '#333333',
      contrastText: '#f4f4f4',
    },
  },
})
