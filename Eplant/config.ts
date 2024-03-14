import React from 'react'

import CellEFP from './views/CellEFP'
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

  readonly defaultSpecies: string
  readonly defaultView: string
}

export const Config = React.createContext<EplantConfig>({
  genericViews: [],
  userViews: [],
  views: [],

  rootPath: '',
  defaultSpecies: '',
  defaultView: 'get-started',
})

export const useConfig = () => React.useContext(Config)
