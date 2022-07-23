import FallbackView from './views/FallbackView'
import GeneInfoView from './views/GeneInfoView'
import GetStartedView from './views/GetStartedView'
import PublicationViewer from './views/PublicationViewer'

// Views that aren't associated with individual genes
export const genericViews = [GetStartedView, FallbackView] as const

// List of views that a user can select from
// Can contain views from the genericViews list too
export const userViews = [GeneInfoView, PublicationViewer] as const

// List of views that are used to lookup a view by id
// Not guaranteed to be free of duplicate views
export const views = [...genericViews, ...userViews] as const
