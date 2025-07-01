import React from 'react'

import GeneticElement from '@eplant/GeneticElement'
import { getCitation } from '@eplant/util/citations'
import { View } from '@eplant/View'

import { createViewSwitchProvider } from '../ViewGeneSwitching'

import NavigatorIcon from './Icons/NavigatorViewIcon'
import NavigatorViewObject from './NavigatorView'

/** Use the provider from helper function */
export const ViewSwitchProvider = createViewSwitchProvider()

/** Create navigator view context */
export const NavigatorContext = React.createContext<{ apiUrl: string }>({
  apiUrl:
    'https://bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi?primaryGene=AT3G24650&species=Arabidopsis&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape',
})

/** Define navigator view configuration */
const NavigatorView: View = {
  name: 'Navigator View',
  component: ({ geneticElement }) => {
    const baseUrl =
      'https://bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi'
    const gene = geneticElement?.id || ''
    const species = geneticElement?.species?.name || ''

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
  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    loadEvent(1)
    return null
  },
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

  citation({ gene }) {
    const citation = getCitation('Navigator viewer') as {
      [key: string]: string
    }

    return (
      <div>
        {citation.source && <p>{citation.source}</p>}
        {/* Waese et al. 2017 + Creative Commons License */}
        <p>
          This image was generated with the Navigator viewer at{' '}
          <a
            href='https://bar.utoronto.ca/eplant'
            target='_blank'
            rel='noopener noreferrer'
          >
            bar.utoronto.ca/eplant
          </a>{' '}
          by Waese et al. 2017.
        </p>

        <a
          href='http://creativecommons.org/licenses/by/4.0/'
          target='_blank'
          rel='noopener noreferrer'
        >
          <img
            alt='Creative Commons License'
            src='https://i.creativecommons.org/l/by/4.0/80x15.png'
            title='The ePlant output for your gene of interest is available under a Creative Commons Attribution 4.0 International License and may be freely used in publications etc.'
          />
        </a>
      </div>
    )
  },
}

export default NavigatorView
