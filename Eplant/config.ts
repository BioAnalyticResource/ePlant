import { type View } from './View'

export type EplantConfig = {
  readonly genericViews: View[]
  readonly userViews: View[]
  readonly views: View[]
  readonly tabHeight: number
  readonly rootPath: string
}
