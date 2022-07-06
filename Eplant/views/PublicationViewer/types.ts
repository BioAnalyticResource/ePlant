export type PublicationData = {
  first_author: string
  journal: string
  pubmed_id: string
  title: string
  year: number
}
export type GeneRIFsData = {
  annotation: string
  locus: string
  publication: { pubmed_id: string }
}

export type PublicationViewerData = {
  publications: PublicationData[]
  geneRIFs: GeneRIFsData[]
}
export type TabValues = 'publications' | 'geneRIFs'
