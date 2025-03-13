import React, { createContext, useContext, useEffect, useState } from 'react'
import _ from 'lodash'
import ReactDOM from 'react-dom/client'

import { useConfig } from '@eplant/config'
import GeneticElement, { Species } from '@eplant/GeneticElement'
import {
  useGeneticElements,
  useSetActiveGeneId,
  useSetActiveViewId,
  useSpecies,
} from '@eplant/state'
import { View } from '@eplant/View'

import { NavigatorIcon } from './Icons/NavigatorViewIcon'
import NavigatorViewObject from './NavigatorView'

/** Defines the data structure for the Navigator View configuration */
interface NavigatorViewData {
  apiUrl: string
}

/**
 * Retrieves a genetic element by its gene name
 * @param geneName - The name of the gene to search for
 * @returns The genetic element matching the gene name, or null if not found
 * This is currently a mock implementation that creates a basic genetic element
 */
const getGeneticElementByGeneName = (
  geneName: string
): GeneticElement | null => {
  const mockGeneticElement = {
    id: geneName,
    species: { name: 'Arabidopsis' },
  } as GeneticElement

  return mockGeneticElement
}

/** Defines the context type for view switching functionality */
interface ViewSwitchContextType {
  activeView: View | null
  activeGene: GeneticElement | null
  switchView: (viewId: string, geneName: string) => void
}

/** Creates a context for managing view and gene switching across the application */
const ViewSwitchContext = createContext<ViewSwitchContextType>({
  activeView: null,
  activeGene: null,
  switchView: () => {},
})

/** Custom hook to access the ViewSwitch context */
export const useViewSwitch = () => useContext(ViewSwitchContext)

/**
 * Provider component for managing view and genetic element state
 * @param props - Component props
 * @param children - Child components to be wrapped by the provider
 */
export const ViewSwitchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeView, setActiveView] = useState<View | null>(null)
  const [activeGene, setActiveGene] = useState<GeneticElement | null>(null)
  const [geneticElements, setGeneticElements] = useGeneticElements()

  /** Required constants for updating the active view and gene */
  const { userViews } = useConfig()
  const setActiveViewId = useSetActiveViewId()
  const setActiveGeneId = useSetActiveGeneId()
  const [speciesList] = useSpecies()
  const species = speciesList.length ? speciesList[0] : undefined

  /**
   * Adds unique genetic elements to the application state
   * @param genes - Array of genetic elements to add
   */
  const addGeneticElements = (genes: GeneticElement[]) => {
    setGeneticElements((prev) => {
      const updatedGenes = _.uniqBy([...prev, ...genes], (gene) => gene.id)
      console.log('Updated geneticElements state:', updatedGenes)
      return updatedGenes
    })

    if (genes.length > 0) {
      setActiveGeneId(genes[0].id)
    }
  }

  /**
   * Ensures that genetic elements in the state are unique
   * Removes duplicate entries based on gene ID
   * Same implementation as in the search bar LeftNav code
   */
  useEffect(() => {
    const uniqueGenes = _.uniqBy(geneticElements, (gene) => gene.id)
    if (uniqueGenes.length !== geneticElements.length) {
      setGeneticElements(uniqueGenes)
    }
  }, [geneticElements, setGeneticElements])

  /**
   * Switches the active view and genetic element
   * @param viewId - The ID of the view to switch to
   * @param geneName - The name of the gene to load
   */
  const switchView = async (viewId: string, geneName: string) => {
    if (!species) {
      console.error('Species configuration is missing.')
      return
    }

    const targetView = userViews.find((view) => view.id === viewId)

    if (!targetView) {
      console.warn(`View with ID ${viewId} not found`)
      return
    }

    let geneticElement = getGeneticElementByGeneName(geneName)

    if (!geneticElement) {
      console.log(
        `GeneticElement not found locally for geneName: ${geneName}. Attempting to load it.`
      )
    }

    try {
      const loadedGene = await species.api.searchGene(geneName)
      if (loadedGene) {
        geneticElement = loadedGene as GeneticElement
        addGeneticElements([geneticElement])
      } else {
        console.warn(`Unable to load gene: ${geneName}`)
        return
      }
    } catch (error) {
      console.error(`Error loading gene ${geneName}:`, error)
      return
    }

    setActiveViewId(targetView.id)
    setActiveView(targetView)
    setActiveGeneId(geneticElement.id)
    setActiveGene(geneticElement)
  }

  return (
    <ViewSwitchContext.Provider value={{ activeView, activeGene, switchView }}>
      {children}
    </ViewSwitchContext.Provider>
  )
}

/** Defines the Navigator View configuration */
const NavigatorView: View = {
  name: 'Navigator View',

  /**
   * Renders the Navigator View component
   * @param props - Component rendering props
   * @param activeData - Currently active data
   * @param geneticElement - The current genetic element
   * @returns The rendered Navigator View
   */
  component: ({ activeData, geneticElement }) => {
    const baseUrl =
      'https://bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi'
    const gene = geneticElement?.id || 'AT3G24650'
    const species = geneticElement?.species?.name || 'Arabidopsis'

    const apiUrl = `${baseUrl}?primaryGene=${encodeURIComponent(
      gene
    )}&species=${encodeURIComponent(
      species
    )}&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape`

    return (
      <NavigatorContext.Provider value={{ apiUrl }}>
        <NavigatorViewObject />
      </NavigatorContext.Provider>
    )
  },

  /**
   * Loads initial data for the view
   * @param gene - The gene to load data for
   * @param loadEvent - Callback to track loading progress
   * @returns Resolves with null (placeholder implementation)
   */
  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    loadEvent(1)
    return null
  },

  /**
   * Retrieves the initial state for the view
   * @returns Initial view state with default transform
   */
  async getInitialState() {
    return {
      transform: {
        dx: 0,
        dy: 0,
      },
    }
  },

  id: 'navigator-view',
  icon: () => <NavigatorIcon />,
}

/** Creates a context for sharing the Navigator API URL */
export const NavigatorContext = React.createContext<{ apiUrl: string }>({
  apiUrl:
    'https://bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi?primaryGene=AT3G24650&species=Arabidopsis&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape',
})

export default NavigatorView
