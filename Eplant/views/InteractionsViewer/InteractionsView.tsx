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
  // TODO: Replace this with correct icon
  icon: () => <PublicationViewerIcon />,
  description: 'Interactions Viewer.',
  // TODO: Replace with correct thumbnail
  thumbnail: ThumbnailLight,
  citation() {
    return <div></div>
  },
  header: () => <div></div>,
  async getInitialData() {
    return
  },
}
