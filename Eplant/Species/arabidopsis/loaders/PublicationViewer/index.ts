import axios from 'axios'
import {
  PublicationData,
  GeneRIFsData,
  PublicationViewerData,
} from '@eplant/views/PublicationViewer/types'
import { View } from '@eplant/views/View'

const out: View<PublicationViewerData>['loadData'] = async (
  geneticElement,
  loadEvent
) => {
  let loaded = 0

  const [publications, geneRIFs] = await Promise.all([
    axios
      .get<{ result: PublicationData[] }>(
        `http://bar.utoronto.ca/webservices/bar_araport/` +
          `publications_by_locus.php?locus=${geneticElement.id}`
      )
      .then((d) => {
        loaded++
        loadEvent(loaded / 2)
        return d.data.result
      }),
    axios
      .get<{ result: GeneRIFsData[] }>(
        `http://bar.utoronto.ca/webservices/bar_araport/` +
          `generifs_by_locus.php?locus=${geneticElement.id}`
      )
      .then((d) => {
        loaded++
        loadEvent(loaded / 2)
        return d.data.result
      }),
  ])

  return {
    publications,
    geneRIFs,
  }
}

export default out
