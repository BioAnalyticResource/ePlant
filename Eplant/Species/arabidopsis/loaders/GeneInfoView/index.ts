import axios from 'axios'
import { GeneFeature, GeneInfoViewData } from '@eplant/views/GeneInfoView'
import { View } from '@eplant/views/View'

const out: View<GeneInfoViewData>['loadData'] = async (
  geneticElement,
  loadEvent
) => {
  // Get general data on the gene
  const [data, features, sequence] = await Promise.all([
    axios
      .get(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `gene_summary_by_locus.php?locus=${geneticElement.id}`
      )
      .then((d) => d.data.result[0]),
    // Get features of the gene (used for gene model and sequence highlighting)
    axios
      .get(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `gene_structure_by_locus.php?locus=${geneticElement.id}`
      )
      .then((d) => d.data.features),

    // Get gene sequence
    axios
      .get(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `get_sequence_by_identifier.php?locus=${geneticElement.id}`
      )
      .then((d) => d.data.result[0].sequence),
  ])

  let geneModelFeatures,
    parentFeatType = 'gene',
    childFeatType

  // Find the subfeatures for this genetic element
  for (const raw of features) {
    const feature = GeneFeature.parse(raw)
    if (feature.uniqueID === geneticElement.id) {
      geneModelFeatures = feature.subfeatures
      parentFeatType = feature.type
      childFeatType = geneModelFeatures[0].type
      break
    }
  }

  // Find the type of the genetic element
  let geneticElementType: string = parentFeatType
  if (parentFeatType == 'gene') {
    geneticElementType = 'non_coding'
    if (childFeatType == 'mRNA') geneticElementType = 'protein_coding'
    else if (childFeatType == 'transcript_region')
      geneticElementType = 'novel_transcribed_region'
  }

  // Protein sequence is only defined for protein_coding genes
  let proteinSequence
  if (geneticElementType == 'protein_coding') {
    proteinSequence = (
      await axios.get(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `get_protein_sequence_by_identifier.php?locus=${geneticElement.id}.1`
      )
    ).data.result[0].sequence
  }

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
    features: geneModelFeatures,
    geneticElementType,
    proteinSequence,
  }
}

export default out