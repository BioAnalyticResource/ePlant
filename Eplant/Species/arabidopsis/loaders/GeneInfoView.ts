import axios from 'axios'
import { GeneInfoViewData } from '@eplant/views/GeneInfoView'
import { View } from '@eplant/views/View'

const out: View['loadData'] = async (geneticElement, loadEvent) => {
  const data = (
    await axios.get(
      `https://bar.utoronto.ca/webservices/bar_araport/` +
        `gene_summary_by_locus.php?locus=${geneticElement.id}`
    )
  ).data.result[0]

  return {
    name: data.name,
    brief_description: data.brief_description,
    computational_description: data.computational_description,
    curator_summary: data.curator_summary,
    location: data.location,
    chromosome_start: parseInt(data.chromosome_start),
    chromosome_end: parseInt(data.chromosome_end),
    strand: data.strand,
  }
}

export default out
