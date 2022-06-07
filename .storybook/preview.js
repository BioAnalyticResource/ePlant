import { CssBaseline, ThemeProvider } from '@mui/material'
import { light, dark } from '../Eplant/theme'
import Container from '@mui/material/Container'
export const decorators = [
  (Story) => (
    <ThemeProvider theme={dark}>
      <Story />
      <CssBaseline />
    </ThemeProvider>
  ),
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
