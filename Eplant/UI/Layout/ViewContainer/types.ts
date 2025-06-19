import GeneticElement from '@eplant/GeneticElement'
import { ViewDataError } from '@eplant/View'

export type ViewContext = {
  geneticElement: GeneticElement | null
  setLoadAmount: (loaded: number) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: ViewDataError | null) => void
}
