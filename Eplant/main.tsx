import * as React from 'react'
import { Provider } from 'jotai'
import * as ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import X from './views/CellEFP'
import DebugView from './views/DebugView'
import ExperimentEFP from './views/ExperimentEFP'
import FallbackView from './views/FallbackView'
import GeneInfoView from './views/GeneInfoView'
import GetStartedView from './views/GetStartedView'
import PlantEFP from './views/PlantEFP'
import PublicationViewer from './views/PublicationViewer'
import { Config } from './config'
import Eplant from './Eplant'

import './css/flexlayout.css'
import './css/index.css'

// Views that aren't associated with individual genes
const genericViews = [GetStartedView, FallbackView]

// List of views that a user can select from
// Can contain views from the genericViews list too
const userViews = [
  GeneInfoView,
  PublicationViewer,
  DebugView,
  PlantEFP,
  X,
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
  return (
    <React.StrictMode>
      <Provider>
        <BrowserRouter>
          <Config.Provider value={defaultConfig}>
            <Eplant />
          </Config.Provider>
        </BrowserRouter>
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
