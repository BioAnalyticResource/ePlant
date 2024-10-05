import GeneticElement from '@eplant/GeneticElement'

export type ViewContext = {
  geneticElement: GeneticElement | null
  setLoadAmount: (loaded: number) => void
  setIsLoading: (isLoading: boolean) => void
}
