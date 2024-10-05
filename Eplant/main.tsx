import * as React from 'react'
import { Provider } from 'jotai'
import * as ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ErrorBoundary from './util/ErrorBoundary'
import { CellEFPView } from './views/CellEFP/CellEFP'
import { Config, defaultConfig } from './config'
import Eplant from './Eplant'

import './css/index.css'

const router = createBrowserRouter([
  {
    path: import.meta.env.BASE_URL,
    element: <Eplant />,
    children: [
      {
        path: '/:geneid?',
        element: <Navigate to={'/cell-efp/'} replace={true}></Navigate>,
        index: true,
      },
      {
        path: '/cell-efp/:geneid?',
        element: <CellEFPView></CellEFPView>,
      },
    ],
    errorElement: <ErrorBoundary></ErrorBoundary>,
  },
])

const queryClient = new QueryClient()

function RootApp() {
  return (
    <React.StrictMode>
      <Provider>
        <Config.Provider value={defaultConfig}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </Config.Provider>
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
