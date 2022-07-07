import { CssBaseline, ThemeProvider } from '@mui/material'
import { light, dark } from '../Eplant/theme'
import Container from '@mui/material/Container'
import '@fontsource/roboto-mono'
import { useEffect, useState } from 'react'
import { speciesAtom, genesAtom } from '../Eplant/state'
import arabidopsis from '../Eplant/Species/arabidopsis'
import geneticElements from '../Eplant/__mocks__/geneticElements'
import { Box } from '@mui/material'
import { DndContext } from '@dnd-kit/core'
import { Provider } from 'jotai'
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
        <Provider initialState={[[genesAtom, geneticElements]]}>
          <Box
            sx={(theme) => ({
              width: '100%',
              height: '100%',
              background: theme.palette.background.paper,
            })}
          >
            <Story />
          </Box>
        </Provider>
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
  backgrounds: {
    default: undefined,
  },
}
