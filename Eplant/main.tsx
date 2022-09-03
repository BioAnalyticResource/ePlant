import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import './flexlayout.css'
import './index.css'
import Eplant from './Eplant'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'jotai'
import { useDarkMode, useDebug, useSetConfig } from '@eplant/state'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { dark, light } from './theme'

import FallbackView from './views/FallbackView'
import GeneInfoView from './views/GeneInfoView'
import GetStartedView from './views/GetStartedView'
import PublicationViewer from './views/PublicationViewer'
import DebugView from './views/DebugView'
import PlantEFP from './views/PlantEFP'
import ExperimentEFP from './views/ExperimentEFP'
import SettingsView from './views/SettingsView'

// Views that aren't associated with individual genes
const genericViews = [GetStartedView, FallbackView, SettingsView]

// List of views that a user can select from
// Can contain views from the genericViews list too
const userViews = [
  GeneInfoView,
  PublicationViewer,
  DebugView,
  PlantEFP,
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
// For some reason this is necessary to make the tabs work, maybe FlexLayout uses a Jotai provider?
const eplantScope = Symbol('Eplant scope')

function RootApp() {
  const [darkMode, setDarkMode] = useDarkMode()
  const setConfig = useSetConfig()
  const [debug] = useDebug()
  React.useEffect(() => setConfig(defaultConfig), [])
  React.useEffect(() => {
    setConfig((config) => {
      if (debug && !config.userViews.some((view) => view.id === 'debug-view')) {
        config.userViews.push(DebugView)
        return { ...config }
      } else if (
        !debug &&
        config.userViews.some((view) => view.id === 'debug-view')
      ) {
        return {
          ...config,
          userViews: config.userViews.filter(
            (view) => view.id !== 'debug-view'
          ),
        }
      }
      return config
    })
  })
  return (
    <React.StrictMode>
      <Provider scope={eplantScope}>
        <ThemeProvider theme={darkMode ? dark : light}>
          <CssBaseline />
          <BrowserRouter>
            <Eplant />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
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
        '/sw.js'
      );
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerServiceWorker();
