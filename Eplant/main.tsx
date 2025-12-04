import { StrictMode } from 'react'
import { Provider } from 'jotai'
import * as ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import ErrorBoundary from './util/ErrorBoundary'
import { CellEFPView } from './views/CellEFP/CellEFP'
import { ChromosomeView } from './views/ChromosomeViewer/ChromosomeView'
import { ExperimentEFPView } from './views/ExperimentEFP/ExperimentEFP'
import { GeneInfoView } from './views/GeneInfoView/GeneInfo'
import GetStartedView from './views/GetStartedView/GetStartedView'
import { InteractionsViewObject } from './views/InteractionsViewer/InteractionsView'
import { NavigatorViewObject } from './views/NavigatorView/NavigatorView'
import { PlantEFPView } from './views/PlantEFP/PlantEFP'
import { PublicationsViewer } from './views/PublicationViewer/PublicationsView'
import { Config, defaultConfig } from './config'
import Eplant from './Eplant'

import './css/index.css'
console.log('DEBUG-')
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
        element: <PublicationsViewer></PublicationsViewer>,
      },
      {
        path: 'chromosome/:geneid?',
        element: <ChromosomeView></ChromosomeView>,
      },
      {
        path: 'plant-efp/:geneid?',
        element: <PlantEFPView></PlantEFPView>,
      },
      {
        path: 'experiment-efp/:geneid?',
        element: <ExperimentEFPView></ExperimentEFPView>,
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
        path: 'interactions-view/:geneid?',
        element: <InteractionsViewObject></InteractionsViewObject>,
      },
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
