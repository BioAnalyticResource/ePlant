import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import './flexlayout.css'
import './index.css'
import Eplant from './Eplant'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'jotai'
import { useDarkMode } from '@eplant/state'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { dark, light } from './theme'

// For some reason this is necessary to make the tabs work, maybe FlexLayout uses a Jotai provider?
const eplantScope = Symbol('Eplant scope')

function RootApp() {
  const [darkMode, setDarkMode] = useDarkMode()
  return (
    <Provider scope={eplantScope}>
      <ThemeProvider theme={darkMode ? dark : light}>
        <CssBaseline />
        <BrowserRouter>
          <Eplant />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RootApp />
)
