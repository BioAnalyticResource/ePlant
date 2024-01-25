import axios from 'axios'
import { GeneFeature, GeneInfoViewData } from '@eplant/views/GeneInfoView/types'
import { View } from '@eplant/View'

const loader: View<GeneInfoViewData>['getInitialData'] = async (
  geneticElement,
  loadEvent,
) => {
  if (!geneticElement)
    throw new TypeError('A gene must be provided for the GeneInfoView')
  let loaded = 0
  // Get general data on the gene
  const [data, features, sequence] = await Promise.all([
    axios
      .get(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `gene_summary_by_locus.php?locus=${geneticElement.id}`,
      )
      .then((d) => {
        loaded++
        loadEvent(loaded / 4)
        return d.data.result[0]
      }),
    // Get features of the gene (used for gene model and sequence highlighting)
    axios
      .get<{
        features: GeneFeature[]
      }>(`https://bar.utoronto.ca/webservices/bar_araport/` + `gene_structure_by_locus.php?locus=${geneticElement.id}`)
      .then((d) => {
        loaded++
        loadEvent(loaded / 4)
        return d.data.features
      }),

    // Get gene sequence
    axios
      .get(
        `https://bar.utoronto.ca/webservices/bar_araport/` +
          `get_sequence_by_identifier.php?locus=${geneticElement.id}`,
      )
      .then((d) => {
        loaded++
        loadEvent(loaded / 4)
        return d.data.result[0].sequence
      }),
  ])

  let geneModelFeatures,
    parentFeatType = 'gene',
    childFeatType

  // Find the subfeatures for this genetic element
  for (const feature of features) {
    if (feature.uniqueID === geneticElement.id) {
      geneModelFeatures = feature.subfeatures
      parentFeatType = feature.type
      childFeatType = geneModelFeatures?.[0]?.type
      break
    }
  }

  // Find the type of the genetic element
  let geneticElementType: GeneInfoViewData['geneticElementType'] =
    parentFeatType as GeneInfoViewData['geneticElementType']
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
          `get_protein_sequence_by_identifier.php?locus=${geneticElement.id}.1`,
      )
    ).data.result[0].sequence
    loadEvent(1)
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
    features: geneModelFeatures ?? [],
    geneticElementType,
    proteinSequence,
  }
}

export default loader
