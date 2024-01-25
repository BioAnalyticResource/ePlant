import { useCitations } from '@eplant/state'

export const getCitation = (viewName: string) => {
  const [citations] = useCitations()
  return citations.find(
    (citation: { [key: string]: string }) => citation.view === viewName,
  )
}
