import React from 'react'

import { type View } from './View'

export type EplantConfig = {
  readonly genericViews: View[]
  readonly userViews: View[]
  readonly views: View[]
  readonly rootPath: string
  readonly defaultView:string
  readonly defaultSpecies:string

}

export const Config = React.createContext<EplantConfig>({
  genericViews: [],
  userViews: [],
  views: [],
  rootPath: '',
  defaultView:'gene-info',
  defaultSpecies:''
})

export const useConfig = () => React.useContext(Config)
