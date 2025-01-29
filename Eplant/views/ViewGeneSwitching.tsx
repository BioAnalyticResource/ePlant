import { createContext, useContext, useEffect, useState } from 'react';
import _ from 'lodash';

import { useConfig } from '@eplant/config';
import GeneticElement from '@eplant/GeneticElement';
import { useGeneticElements, useSetActiveGeneId, useSetActiveViewId, useSpecies } from '@eplant/state';
import { View } from '@eplant/View';

/** 
 * Interface defining the shape of the ViewSwitch context
 */
interface ViewSwitchContextType {
  /** Currently active view */
  activeView: View | null;
  /** Currently active genetic element */
  activeGene: GeneticElement | null;
  /** Function to switch view only */
  switchViewOnly: (viewId: string) => Promise<void>;
  /** Function to switch gene only */
  switchGeneOnly: (geneName: string) => Promise<void>;
  /** Function to switch both view and gene */
  switchViewAndGene: (viewId: string, geneName: string, species?: string) => Promise<void>;
}

/** Default context value */
const ViewSwitchContext = createContext<ViewSwitchContextType>({
  activeView: null,
  activeGene: null,
  switchViewOnly: async () => {},
  switchGeneOnly: async () => {},
  switchViewAndGene: async () => {},
});

/** Hook to access the ViewSwitch context */
export const useViewSwitch = () => useContext(ViewSwitchContext);

/**
 * Creates a ViewSwitch provider component
 * @returns A React component that provides view switching functionality
 */
export const createViewSwitchProvider = () => {
  /**
   * ViewSwitch Provider Component
   * @param props - Component props
   */
  const ViewSwitchProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeView, setActiveView] = useState<View | null>(null);
    const [activeGene, setActiveGene] = useState<GeneticElement | null>(null);
    const [geneticElements, setGeneticElements] = useGeneticElements();
    
    const { userViews } = useConfig();
    const setActiveViewId = useSetActiveViewId();
    const setActiveGeneId = useSetActiveGeneId();
    const [speciesList] = useSpecies();
    const species = speciesList.length ? speciesList[0] : undefined;

    /**
     * Adds genetic elements to the state, ensuring uniqueness
     * @param genes - Array of genetic elements to add
     */
    const addGeneticElements = (genes: GeneticElement[]) => {
      setGeneticElements((prev) => {
        const updatedGenes = _.uniqBy([...prev, ...genes], (gene) => gene.id);
        return updatedGenes;
      });

      if (genes.length > 0) {
        setActiveGeneId(genes[0].id);
      }
    };

    // Ensure genetic elements remain unique
    useEffect(() => {
      const uniqueGenes = _.uniqBy(geneticElements, (gene) => gene.id);
      if (uniqueGenes.length !== geneticElements.length) {
        setGeneticElements(uniqueGenes);
      }
    }, [geneticElements, setGeneticElements]);

    /**
     * Validates and retrieves a view by ID
     * @param viewId - The ID of the view to validate
     * @returns The validated view or null
     */
    const validateView = (viewId: string): View | null => {
      const targetView = userViews.find((view) => view.id === viewId);
      if (!targetView) {
        console.warn(`View with ID ${viewId} not found`);
        return null;
      }
      return targetView;
    };

    /**
     * Loads a gene by name
     * @param geneName - The name of the gene to load
     * @returns The loaded genetic element or null
     */
    const loadGene = async (geneName: string): Promise<GeneticElement | null> => {
      if (!species) {
        console.error("Species configuration is missing.");
        return null;
      }

      try {
        const loadedGene = await species.api.searchGene(geneName);
        return loadedGene as GeneticElement;
      } catch (error) {
        console.error(`Error loading gene ${geneName}:`, error);
        return null;
      }
    };

    /**
     * Handles navigation to external species links
     * @param speciesUrl - The URL to navigate to
     * @param geneName - The gene identifier
     */
        const handleExternalSpecies = (speciesUrl: string, geneName: string): void => {
          /** const fullUrl = `${speciesUrl}${geneName}`; */ 
          const fullUrl = `${speciesUrl}`;
          window.open(fullUrl, '_blank');
        };

    /**
     * Switches only the view, keeping the current gene
     * @param viewId - ID of the view to switch to
     */
    const switchViewOnly = async (viewId: string): Promise<void> => {
      
      const targetView = validateView(viewId);
      
      if (targetView) {
        setActiveViewId(targetView.id);
        setActiveView(targetView);
      }
    };

    /**
     * Switches only the gene, keeping the current view
     * @param geneName - Name of the gene to switch to
     */
    const switchGeneOnly = async (geneName: string, speciesUrl?: string): Promise<void> => {
      
      if (speciesUrl) {
        handleExternalSpecies(speciesUrl, geneName);
      }
      
      const geneticElement = await loadGene(geneName);
      
      if (geneticElement) {
        addGeneticElements([geneticElement]);
        setActiveGeneId(geneticElement.id);
        setActiveGene(geneticElement);
      }
    };

    /**
     * Switches both view and gene
     * @param viewId - ID of the view to switch to
     * @param geneName - Name of the gene to switch to
     */
    const switchViewAndGene = async (viewId: string, geneName: string, speciesUrl?: string): Promise<void> => {
      
      if (speciesUrl) {
        handleExternalSpecies(speciesUrl, geneName);
      }

      const targetView = validateView(viewId);
      const geneticElement = await loadGene(geneName);

      if (targetView && geneticElement) {
        addGeneticElements([geneticElement]);
        setActiveViewId(targetView.id);
        setActiveView(targetView);
        setActiveGeneId(geneticElement.id);
        setActiveGene(geneticElement);
      }
    };

    return (
      <ViewSwitchContext.Provider 
        value={{ 
          activeView, 
          activeGene, 
          switchViewOnly,
          switchGeneOnly,
          switchViewAndGene
        }}
      >
        {children}
      </ViewSwitchContext.Provider>
    );
  };

  ViewSwitchProvider.displayName = 'ViewSwitchProvider';
  return ViewSwitchProvider;
};