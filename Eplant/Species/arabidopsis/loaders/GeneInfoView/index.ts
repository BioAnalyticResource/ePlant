import axios from 'axios'
import { GeneInfoViewData } from '@eplant/views/GeneInfoView'
import { View } from '@eplant/views/View'

const out: View['loadData'] = async (geneticElement, loadEvent) => {
  const data: Partial<GeneInfoViewData> = {}
  const summary = (
    await axios.get(
      '//bar.utoronto.ca/webservices/bar_araport/gene_summary_by_locus.php?locus=' +
        geneticElement.id
    )
  ).data.result[0]
  return data
}

export default out
