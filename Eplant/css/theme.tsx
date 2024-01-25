import { createTheme, PaletteColorOptions } from '@mui/material'

declare module '@mui/material/styles' {
  interface TypeBackground {
    active: string
    paperOverlay: string
    transparentOverlay: string
    selected: string
    hover: string
    edge: string
    edgeLight: string
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
      main: '#779E00',
      dark: '#c2e066',
    },
    secondary: {
      main: '#888',
      contrastText: '#000',
    },
    background: {
      default: '#f0f7f0', // bottom (left nav & overall page bg)
      paper: '#f4f4f4', // middle (bg for all the views & unselected tabs)
      paperOverlay: '#ffffff', // top level (EFP chart bg, etc)
      transparentOverlay: '#fdfdfdDD', // tooltip bg
      active: '#fafafa', // active gene bg & toolbar
      selected: '#dddddd', // is this used?
      hover: '#cccccc', // hovered gene
      edge: '#DDDDDD', // borders around EFP canvas
      edgeLight: '#EEEEEE', // lighter borders around page views
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
      default: '#181c18',
      paper: '#1F1F1F',
      paperOverlay: '#2C2C2C',
      transparentOverlay: '#333333EE',
      selected: '#333333',
      active: '#3a3a3a',
      hover: '#444444',
      edge: '#444444',
      edgeLight: '#333333',
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