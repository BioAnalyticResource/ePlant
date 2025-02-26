import React from 'react'

import ThumbnailLight from '../../../thumbnails/plant-efp-light.png'
import { ViewMetadata } from '../../View'
import PublicationViewerIcon from '../PublicationViewer/icon'

const InteractionsViewer: ViewMetadata = {
  name: 'Interactions Viewer',
  id: 'interactions-viewer',
  icon: () => <></>,
  description: 'Interactions Viewer.',
  citation() {
    return <div></div>
  },
}
