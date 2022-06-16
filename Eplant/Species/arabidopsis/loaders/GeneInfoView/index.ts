import axios from 'axios'
import { GeneInfoViewData } from '@eplant/views/GeneInfoView'
import { View } from '@eplant/views/View'

const out: View['loadData'] = async (geneticElement, loadEvent) => {
  // Get general data on the gene
  const data = (
    await axios.get(
      `https://bar.utoronto.ca/webservices/bar_araport/` +
        `gene_summary_by_locus.php?locus=${geneticElement.id}`
    )
  ).data.result[0]

  // Get features of the gene (used for gene model and sequence highlighting)
  const features = (
    await axios.get(
      `https://bar.utoronto.ca/webservices/bar_araport/` +
        `gene_structure_by_locus.php?locus=${geneticElement.id}`
    )
  ).data.features[0]

  // Get gene sequence
  const sequence = (
    await axios.get(
      `https://bar.utoronto.ca/webservices/bar_araport/` +
        `get_sequence_by_identifier.php?locus=${geneticElement.id}`
    )
  ).data.result[0].sequence

  return {
    name: data.name,
    brief_description: data.brief_description,
    computational_description: data.computational_description,
    curator_summary: data.curator_summary,
    location: data.location,
    chromosome_start: parseInt(data.chromosome_start),
    chromosome_end: parseInt(data.chromosome_end),
    strand: data.strand,
    geneSequence: sequence,
  }
}

export default out
