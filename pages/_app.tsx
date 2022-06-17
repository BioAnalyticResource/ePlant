import { dark } from '@eplant/theme'
import { CssBaseline, ThemeProvider } from '@mui/material'
import type { AppProps } from 'next/app'
import '@fontsource/roboto-mono'

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={dark}>
      <Component {...pageProps} />
      <CssBaseline />
    </ThemeProvider>
  )
}

export default App
