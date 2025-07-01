import { createContext, useContext } from 'react'

import CellEFP from './views/CellEFP'
import { ChromosomeViewerObject } from './views/ChromosomeViewer'
import ExperimentEFP from './views/ExperimentEFP'
import FallbackView from './views/FallbackView'
import GeneInfoViewMetadata from './views/GeneInfoView'
import GetStartedView from './views/GetStartedView'
import NavigatorView from './views/NavigatorView'
import PlantEFP from './views/PlantEFP'
import PublicationViewer from './views/PublicationViewer'
// import WorldEFP from './views/WorldEFP'
import { type ViewMetadata } from './View'

export type EplantConfig = {
  readonly genericViews: ViewMetadata[]
  readonly userViews: ViewMetadata[]
  readonly views: ViewMetadata[]
  readonly rootPath: string
  readonly defaultView: string
  readonly defaultSpecies: string
}

// Views that aren't associated with individual genes
const genericViewMetadata = [GetStartedView, FallbackView]

// List of views that a user can select from
// Can contain views from the genericViews list too
const userViewMetadata = [
  GetStartedView,
  GeneInfoViewMetadata,
  PublicationViewer,
  PlantEFP,
  CellEFP,
  ExperimentEFP,
  // WorldEFP,
  ChromosomeViewerObject,
  NavigatorView,
]

// List of views that are used to lookup a view by id
const views = [...genericViewMetadata, ...userViewMetadata]

export const defaultConfig = {
  genericViews: genericViewMetadata,
  userViews: userViewMetadata,
  views,
  rootPath: import.meta.env.BASE_URL,
  defaultView: 'gene-info',
  defaultSpecies: '',
}

export const Config = createContext<EplantConfig>(defaultConfig)

export const useConfig = () => useContext(Config)
