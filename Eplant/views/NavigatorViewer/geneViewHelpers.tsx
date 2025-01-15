import { createContext, useContext, useEffect,useState } from 'react';
import _ from 'lodash';

import { useConfig } from '@eplant/config';
import GeneticElement from '@eplant/GeneticElement';
import { useGeneticElements, useSetActiveGeneId, useSetActiveViewId, useSpecies } from '@eplant/state';
import { View } from '@eplant/View';

interface ViewSwitchContextType {
  activeView: View | null;
  activeGene: GeneticElement | null;
  switchView: (viewId: string, geneName: string) => void;
}

const ViewSwitchContext = createContext<ViewSwitchContextType>({
  activeView: null,
  activeGene: null,
  switchView: () => {},
});

export const useViewSwitch = () => useContext(ViewSwitchContext);

export const createViewSwitchProvider = () => {
    const ViewSwitchProvider = ({ children }: { children: React.ReactNode }) => {
      const [activeView, setActiveView] = useState<View | null>(null);
      const [activeGene, setActiveGene] = useState<GeneticElement | null>(null);
      const [geneticElements, setGeneticElements] = useGeneticElements();
      
      const { userViews } = useConfig();
      const setActiveViewId = useSetActiveViewId();
      const setActiveGeneId = useSetActiveGeneId();
      const [speciesList] = useSpecies();
      const species = speciesList.length ? speciesList[0] : undefined;
  
      const addGeneticElements = (genes: GeneticElement[]) => {
        setGeneticElements((prev) => {
          const updatedGenes = _.uniqBy([...prev, ...genes], (gene) => gene.id);
          return updatedGenes;
        });
  
        if (genes.length > 0) {
          setActiveGeneId(genes[0].id);
        }
      };

    useEffect(() => {
      const uniqueGenes = _.uniqBy(geneticElements, (gene) => gene.id);
      if (uniqueGenes.length !== geneticElements.length) {
        setGeneticElements(uniqueGenes);
      }
    }, [geneticElements, setGeneticElements]);

    const switchView = async (viewId: string, geneName: string) => {
      if (!species) {
        console.error("Species configuration is missing.");
        return;
      }

      const targetView = userViews.find((view) => view.id === viewId);

      if (!targetView) {
        console.warn(`View with ID ${viewId} not found`);
        return;
      }

      try {
        const loadedGene = await species.api.searchGene(geneName);
        if (loadedGene) {
          const geneticElement = loadedGene as GeneticElement;
          addGeneticElements([geneticElement]);
          
          setActiveViewId(targetView.id);
          setActiveView(targetView);
          setActiveGeneId(geneticElement.id);
          setActiveGene(geneticElement);
        } else {
          console.warn(`Unable to load gene: ${geneName}`);
          return;
        }
      } catch (error) {
        console.error(`Error loading gene ${geneName}:`, error);
        return;
      }
    };

    return (
      <ViewSwitchContext.Provider value={{ activeView, activeGene, switchView }}>
        {children}
      </ViewSwitchContext.Provider>
    );
  };

  ViewSwitchProvider.displayName = 'ViewSwitchProvider';

  return ViewSwitchProvider;
};