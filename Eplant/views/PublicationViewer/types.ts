import { z } from 'zod';


export const PublicationData = z.object({
  first_author: z.string(),
  journal: z.string(),
  pubmed_id: z.string(),
  title: z.string(),
  year: z.number().int(),
});
export type PublicationData = z.infer<typeof PublicationData>;
export const GeneRIFsData = z.object({
  annotation: z.string(),
  locus: z.string(),
  publication: z.object({ pubmed_id: z.string() }),
});
export type GeneRIFsData = z.infer<typeof GeneRIFsData>;

export const PublicationViewerData = z.object({
  publications: PublicationData.array(),
  geneRIFs: GeneRIFsData.array(),
});
export type PublicationViewerData = z.infer<typeof PublicationViewerData>;
export type TabValues = 'publications' | 'geneRIFs';
