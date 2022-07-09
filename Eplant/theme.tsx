import { createTheme, ThemeOptions } from '@mui/material'

export const light: ThemeOptions = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#99CC00',
    },
    secondary: {
      main: '#888',
    },
    background: {
      paper: '#f5f5f5',
    },
  },
  shape: {
    borderRadius: 2,
  },
})

export const dark: ThemeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#99CC00',
    },
    secondary: {
      main: '#9e9e9e',
    },
    background: {
      default: '#121212',
      paper: '#222222',
    },
  },
  shape: {
    borderRadius: 2,
  },
})
