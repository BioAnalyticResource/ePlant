import * as React from 'react'
import { Provider } from 'jotai'
import * as ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'

import { CssBaseline, ThemeProvider } from '@mui/material'

import { dark, light } from './css/theme'
import Sidebar from './UI/Sidebar'
import CellEFP from './views/CellEFP'
import DebugView from './views/DebugView'
import ExperimentEFP from './views/ExperimentEFP'
import FallbackView from './views/FallbackView'
import GeneInfoView from './views/GeneInfoView'
import GetStartedView from './views/GetStartedView'
import PlantEFP from './views/PlantEFP'
import PublicationViewer from './views/PublicationViewer'
import { Config, EplantConfig, useConfig } from './config'
import Eplant from './Eplant'
import { useDarkMode } from './state'

// Views that aren't associated with individual genes
const genericViews = [GetStartedView, FallbackView]

// List of views that a user can select from
// Can contain views from the genericViews list too
const userViews = [
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

export const defaultConfig: EplantConfig = {
  genericViews,
  userViews,
  views,
  rootPath: import.meta.env.BASE_URL,

  defaultSpecies: 'Arabidopsis',
  defaultView: 'get-started',
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={defaultConfig.rootPath} element={<Eplant />}>
      <Route path={'/:viewId'} element={<Eplant />}>
        <Route path={':geneId'} element={<Eplant />}></Route>
      </Route>
    </Route>
  )
)

function RootApp() {
  const { rootPath } = useConfig()
  const [darkMode] = useDarkMode()
  return (
    <React.StrictMode>
      <ThemeProvider theme={darkMode ? dark : light}>
        <CssBaseline />
        <Provider>
          <Config.Provider value={defaultConfig}>
            <RouterProvider router={router} />
          </Config.Provider>
        </Provider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RootApp />
)

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        import.meta.env.BASE_URL + '/sw.js'
      )
      if (registration.installing) {
        // console.log('Service worker installing')
      } else if (registration.waiting) {
        // console.log('Service worker installed')
      } else if (registration.active) {
        // console.log('Service worker active')
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`)
    }
  }
}

registerServiceWorker()
