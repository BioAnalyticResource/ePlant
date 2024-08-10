import React from 'react'

import ThumbnailLight from '../../../thumbnails/plant-efp-light.png'
import { View } from '../../View'
import PublicationViewerIcon from '../PublicationViewer/icon'

const InteractionsViewer: View = {
  name: 'Interactions Viewer',
  id: 'interactions-viewer',
  component() {
    return <div>This is not implemented yet!</div>
  },
  icon: () => <></>,
  description: 'Interactions Viewer.',
  citation() {
    return <div></div>
  },
  async getInitialData() {
    return
  },
}
