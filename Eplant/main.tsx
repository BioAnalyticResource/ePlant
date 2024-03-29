import * as React from 'react'
import { Provider } from 'jotai'
import * as ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { Config, defaultConfig } from './config'
import Eplant from './Eplant'

import './css/index.css'

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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<RootApp />)

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        import.meta.env.BASE_URL + '/sw.js'
      )
    } catch (error) {
      console.error(`Registration failed with ${error}`)
    }
  }
}

registerServiceWorker()
