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
import { AtGenExpress } from './views/TissueEFP'

// Views that aren't associated with individual genes
const genericViews = [GetStartedView, FallbackView]

// List of views that a user can select from
// Can contain views from the genericViews list too
const userViews = [GeneInfoView, PublicationViewer, DebugView, AtGenExpress]

// List of views that are used to lookup a view by id
const views = [...genericViews, ...userViews]

const tabHeight = 48
const rootPath = ''

export const defaultConfig = {
  genericViews,
  userViews,
  views,
  tabHeight,
  rootPath,
}
// For some reason this is necessary to make the tabs work, maybe FlexLayout uses a Jotai provider?
const eplantScope = Symbol('Eplant scope')

function RootApp() {
  const [darkMode, setDarkMode] = useDarkMode()
  return (
    <Provider scope={eplantScope}>
      <ThemeProvider theme={darkMode ? dark : light}>
        <CssBaseline />
        <BrowserRouter>
          <Config.Provider value={defaultConfig}>
            <Eplant />
          </Config.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RootApp />
)
