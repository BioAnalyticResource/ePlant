import {
  createTheme,
  PaletteColorOptions,
  ThemeOptions,
  TypeBackground,
} from '@mui/material'
import React from 'react'

declare module '@mui/material/styles' {
  interface TypeBackground {
    active: string
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
      dark: '#5c7a00',
    },
    secondary: {
      main: '#888',
      contrastText: '#000',
    },
    background: {
      default: '#eeeeee',
      paper: '#ffffff',
      paperOverlay: '#f4f4f4',
      active: '#dddddd',
      hover: '#bbbbbb',
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
      default: '#111111',
      paper: '#222222',
      paperOverlay: '#333333',
      active: '#444444',
      hover: '#555555',
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
