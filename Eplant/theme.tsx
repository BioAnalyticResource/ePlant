import { createTheme, PaletteColorOptions } from '@mui/material'

declare module '@mui/material/styles' {
  interface TypeBackground {
    active: string
    paperOverlay: string
    transparentOverlay: string
    selected: string
    hover: string
  }
  interface PaletteColor {
    pale?: string
  }
  interface Palette {
    hot: PaletteColor
    cold: PaletteColor
    neutral: PaletteColor
  }
  interface PaletteOptions {
    hot: PaletteColorOptions
    cold: PaletteColorOptions
    neutral: PaletteColorOptions
  }
}

export const light = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#99CC00',
      dark: '#c2e066',
    },
    secondary: {
      main: '#888',
      contrastText: '#000',
    },
    background: {
      default: '#f6f6f6',
      paper: '#ffffff',
      paperOverlay: '#fafafa',
      transparentOverlay: '#fafafaCC',
      active: '#eeeeee',
      selected: '#dddddd',
      hover: '#cccccc',
    },
    hot: {
      main: '#ff0000',
    },
    cold: {
      main: '#0000ff',
    },
    neutral: {
      main: '#ffff00',
    },
  },
  shape: {
    borderRadius: 6,
  },
})
if (light.palette?.primary) light.palette.primary.pale = '#fbfff2'

export const dark = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#99CC00',
      dark: '#5c7a00',
    },
    secondary: {
      main: '#9e9e9e',
      contrastText: '#fff',
    },
    background: {
      default: '#181818',
      paper: '#1F1F1F',
      paperOverlay: '#2C2C2C',
      transparentOverlay: '#333333DD',
      selected: '#333333',
      active: '#3a3a3a',
      hover: '#444444',
    },
    hot: {
      main: '#ff0000',
    },
    cold: {
      main: '#0000ff',
    },
    neutral: {
      main: '#ffff00',
    },
  },
  shape: {
    borderRadius: 6,
  },
})

if (dark.palette?.primary) dark.palette.primary.pale = '#303328'
