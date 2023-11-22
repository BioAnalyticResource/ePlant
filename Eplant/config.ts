import {createContext, useContext} from 'react'
import { type View } from './View'

export type EplantConfig = {
  readonly genericViews: View[]
  readonly userViews: View[]
  readonly views: View[]
  readonly tabHeight: number
  readonly rootPath: string
}

export const Config = createContext<EplantConfig>({
  genericViews: [],
  userViews: [],
  views: [],
  tabHeight: 48,
  rootPath: ''
})

export const useConfig = () => useContext(Config)
