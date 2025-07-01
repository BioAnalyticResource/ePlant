import React from 'react'

import { getCitation } from '@eplant/util/citations'
import { ViewMetadata } from '@eplant/View'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'

import { NavigatorIcon } from './Icons/Nav_NavigatorViewIcon'
import { NavigatorViewerData, NavigatorViewerState } from './types'

const NavigatorView: ViewMetadata<NavigatorViewerData, NavigatorViewerState> = {
  id: 'navigator-view',
  name: 'Navigator View',
  icon: () => <NavigatorIcon />,
  citation() {
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
  actions: [
    {
      name: 'Reset Pan/Zoom',
      description: 'Reset the pan and zoom of the viewer',
      icon: <YoutubeSearchedForRoundedIcon />,
      mutation: (prevState) => ({
        ...prevState,
        transform: {
          offset: {
            x: 0,
            y: 0,
          },
          zoom: 1,
        },
      }),
    },
  ],
}

export default NavigatorView
