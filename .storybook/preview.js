import { CssBaseline, ThemeProvider } from '@mui/material'
import { light, dark } from '../Eplant/theme'
import Container from '@mui/material/Container'
import '@fontsource/roboto-mono'
import { useEffect, useState } from 'react'
import EplantStateProvider from '../Eplant/contexts/EplantState'
import arabidopsis from '../Eplant/Species/arabidopsis'
import geneticElements from '../Eplant/__mocks__/geneticElements'
export const decorators = [
  (Story) => {
    const [darkMode, setDarkMode] = useState(true)
    useEffect(() => {
      const listener = (ev) => {
        if (ev.key == 'D') setDarkMode(!darkMode)
      }
      document.addEventListener('keyup', listener)
      return () => document.removeEventListener('keyup', listener)
    })
    return (
      <ThemeProvider theme={darkMode ? dark : light}>
        <EplantStateProvider species={[arabidopsis]} genes={geneticElements}>
          <Story />
        </EplantStateProvider>
        <CssBaseline />
      </ThemeProvider>
    )
  },
]

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
