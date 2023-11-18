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

import FallbackView from './views/FallbackView'
import GeneInfoView from './views/GeneInfoView'
import GetStartedView from './views/GetStartedView'
import PublicationViewer from './views/PublicationViewer'
import { Config } from './config'
import DebugView from './views/DebugView'
import PlantEFP from './views/PlantEFP'
import ExperimentEFP from './views/ExperimentEFP'
import CellEFP from './views/CellEFP'

// Views that aren't associated with individual genes
const genericViews = [GetStartedView, FallbackView]

// List of views that a user can select from
// Can contain views from the genericViews list too
const userViews = [
  GetStartedView,
  GeneInfoView,
  PublicationViewer,
  DebugView,
  PlantEFP,
  CellEFP,
  ExperimentEFP,
]

// List of views that are used to lookup a view by id
const views = [...genericViews, ...userViews]

const tabHeight = 48

export const defaultConfig = {
  genericViews,
  userViews,
  views,
  tabHeight,
  rootPath: import.meta.env.BASE_URL,
}
function RootApp() {
  const [darkMode, setDarkMode] = useDarkMode()
  return (
    <React.StrictMode>
      <Provider>
        <ThemeProvider theme={darkMode ? dark : light}>
          <CssBaseline />
          <BrowserRouter>
            <Config.Provider value={defaultConfig}>
              <Eplant />
            </Config.Provider>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RootApp />,
)

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        import.meta.env.BASE_URL + '/sw.js',
      )
      if (registration.installing) {
        console.log('Service worker installing')
      } else if (registration.waiting) {
        console.log('Service worker installed')
      } else if (registration.active) {
        console.log('Service worker active')
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`)
    }
  }
}

registerServiceWorker()
