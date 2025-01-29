import React from 'react';

import GeneticElement from '@eplant/GeneticElement';
import { View } from '@eplant/View';

import { createViewSwitchProvider } from '../ViewGeneSwitching';

import { NavigatorIcon } from './Icons/NavigatorViewIcon';
import NavigatorViewObject from './NavigatorView';

/** Use the provider from helper function */
export const ViewSwitchProvider = createViewSwitchProvider();

/** Create navigator view context */
export const NavigatorContext = React.createContext<{ apiUrl: string }>({
  apiUrl: 'https://bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi?primaryGene=AT3G24650&species=Arabidopsis&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape'
});

/** Define navigator view configuration */
const NavigatorView: View = {
  name: 'Navigator View',
  component: ({ geneticElement }) => {
    const baseUrl = 'https://bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi';
    const gene = geneticElement?.id || '';
    const species = geneticElement?.species?.name || '';

    const apiUrl = `${baseUrl}?primaryGene=${encodeURIComponent(gene)}&species=${encodeURIComponent(species)}&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape`;

    return (
      <NavigatorContext.Provider value={{ apiUrl }}>
        <NavigatorViewObject />
      </NavigatorContext.Provider>
    );
  },
  async getInitialData(gene: GeneticElement | null, loadEvent: (progress: number) => void) {
    loadEvent(1);
    return null;
  },
  async getInitialState() {
    return {
      transform: {
        dx: 0,
        dy: 0,
      },
    };
  },
  id: 'navigator-view',
  icon: () => <NavigatorIcon />,
};

export default NavigatorView;