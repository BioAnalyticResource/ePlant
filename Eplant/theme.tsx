import { createTheme, ThemeOptions } from '@mui/material'

export const light: ThemeOptions = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#99CC00',
    },
    secondary: {
      main: '#e9e9e9',
    },
    background: {
      paper: '#fafafa',
    },
  },
  shape: {
    borderRadius: '4px',
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
    },
    background: {
      default: '#121212',
      paper: '#222222',
    },
  },
  shape: {
    borderRadius: '4px',
  },
})
