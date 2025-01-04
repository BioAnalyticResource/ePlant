import GeneticElement from '@eplant/GeneticElement'
import { StateAction } from '@eplant/util/stateUtils'

export type ViewContext = {
  geneticElement: GeneticElement | null
  setLoadAmount: (loaded: number) => void
  setIsLoading: (isLoading: boolean) => void
  setActiveActions: (actions: StateAction<any>[]) => void
}
