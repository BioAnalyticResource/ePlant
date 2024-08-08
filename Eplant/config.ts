import { createContext, useContext } from 'react'

import CellEFP from './views/CellEFP'
import ChromosomeViewer from './views/ChromosomeViewer'
import DebugView from './views/DebugView'
import ExperimentEFP from './views/ExperimentEFP'
import FallbackView from './views/FallbackView'
import GeneInfoView from './views/GeneInfoView'
import GetStartedView from './views/GetStartedView'
import PlantEFP from './views/PlantEFP'
import PublicationViewer from './views/PublicationViewer'
import { type View } from './View'

export type EplantConfig = {
  readonly genericViews: View[]
  readonly userViews: View[]
  readonly views: View[]
  readonly rootPath: string
  readonly defaultView: string
  readonly defaultSpecies: string
}

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
  ChromosomeViewer,
]

// List of views that are used to lookup a view by id
const views = [...genericViews, ...userViews]

export const defaultConfig = {
  genericViews,
  userViews,
  views,
  rootPath: import.meta.env.BASE_URL,
  defaultView: 'gene-info',
  defaultSpecies: '',
}

export const Config = createContext<EplantConfig>(defaultConfig)

export const useConfig = () => useContext(Config)
