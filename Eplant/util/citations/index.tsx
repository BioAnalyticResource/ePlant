import GeneticElement from "@eplant/GeneticElement"
import { citationsAtom, useCitations } from "@eplant/state"
import { useAtomValue } from "jotai"

export const getCitation = (viewName: string) => {
    const [citations] = useCitations()
    return citations.find((citation: { [key: string]: string }) => citation.view === viewName)
}
