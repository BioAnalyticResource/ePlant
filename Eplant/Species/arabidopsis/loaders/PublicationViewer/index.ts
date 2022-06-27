import axios from 'axios'
import {
  PublicationData,
  GeneRIFsData,
  PublicationViewerData
} from "@eplant/views/PublicationViewer/types"
import { View } from '@eplant/views/View'

const out: View<PublicationViewerData>['loadData'] = async (
  geneticElement,
  loadEvent
) => {
  // Get publication data
  const publications = await axios.get<PublicationData[]>(
    `http://bar.utoronto.ca/webservices/bar_araport/` +
      `publications_by_locus.php?locus=${geneticElement.id}`
  )
  // Get gene RIFs data
  const geneRIFs = await axios.get<GeneRIFsData[]>(
    `http://bar.utoronto.ca/webservices/bar_araport/` +
      `generifs_by_locus.php?locus=${geneticElement.id}`
  )
  return {
    publications,
    geneRIFs,
  }
}

export default out
