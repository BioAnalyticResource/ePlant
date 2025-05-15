import { StrictMode } from 'react'
import { Provider } from 'jotai'
import * as ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import ErrorBoundary from './util/ErrorBoundary'
import { CellEFPView } from './views/CellEFP/CellEFP'
import { ChromosomeView } from './views/ChromosomeViewer/ChromosomeView'
import { ExperimentEFP } from './views/ExperimentEFP/ExperimentEFP'
import { GeneInfoView } from './views/GeneInfoView/GeneInfo'
import GetStartedView from './views/GetStartedView/GetStartedView'
import { InteractionsViewObject } from './views/InteractionsViewer/InteractionsView'
import { NavigatorViewObject } from './views/NavigatorView/NavigatorView'
import { PlantEFP } from './views/PlantEFP/PlantEFP'
import { PublicationsView } from './views/PublicationViewer/PublicationsView'
import { Config, defaultConfig } from './config'
import Eplant from './Eplant'

import './css/index.css'
const router = createBrowserRouter([
  {
    path: '/',
    element: <Eplant />,
    children: [
      {
        element: <Navigate to={'gene-info/'} replace={true}></Navigate>,
      },
      {
        path: 'cell-efp/:geneid?',
        element: <CellEFPView></CellEFPView>,
      },
      {
        path: 'publications/:geneid?',
        element: <PublicationsView></PublicationsView>,
      },
      {
        path: 'chromosome/:geneid?',
        element: <ChromosomeView></ChromosomeView>,
      },
      {
        path: 'plant-efp/:geneid?',
        element: <PlantEFP></PlantEFP>,
      },
      {
        path: 'tissue/:geneid?',
        element: <ExperimentEFP></ExperimentEFP>,
      },
      {
        path: 'gene-info/:geneid?',
        element: <GeneInfoView></GeneInfoView>,
      },
      {
        path: 'get-started/:geneid?',
        element: <GetStartedView></GetStartedView>,
      },
      {
        path: 'navigator-view/:geneid?',
        element: <NavigatorViewObject></NavigatorViewObject>,
      },
      {
        path: 'interactions-viewer/:geneid?',
        element: <InteractionsViewObject></InteractionsViewObject>
      }
    ],
    errorElement: <ErrorBoundary></ErrorBoundary>,
  },
])

export const queryClient = new QueryClient()

function RootApp() {
  return (
    <StrictMode>
      <Provider>
        <Config.Provider value={defaultConfig}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </Config.Provider>
      </Provider>
    </StrictMode>
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
