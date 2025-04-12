import { z } from 'zod'

/**
 * Interface representing the tree data structure received from the API
 *
 * @param tree - Newick format string representing the phylogenetic tree
 * @param efp_links - Map of gene identifiers to their expression profile URLs
 * @param genomes - Map of gene identifiers to their genome information
 * @param SCC_values - Map of gene identifiers to their expression correlation values
 * @param sequence_similarity - Map of gene identifiers to their sequence similarity scores
 * @param maximum_values - Map of gene identifiers to their maximum normalized values
 */
export interface TreeData {
  tree: string
  efp_links: Record<string, string>
  genomes: Record<string, string>
  SCC_values: Record<string, number>
  sequence_similarity: Record<string, number>
  maximum_values: Record<string, number>
}

/**
 * Interface representing a node in the D3 hierarchy structure
 *
 * @param name - Node identifier or name
 * @param value - Optional numerical value representing branch length
 * @param children - Optional array of child nodes in the tree
 * @param metadata - Optional metadata associated with the node
 */
export interface D3Node {
  name: string
  value: number
  children?: D3Node[]
  metadata?: {
    genome?: string
    scc_value?: number
    sequence_similarity?: number
    efp_link?: string
  }
}

/** Define the data structure returned by the loader */
export interface NavigatorViewerData {
  treeData: TreeData // The actual tree data fetched from API
  url: string // The URL used to fetch the data (for reference)
}

/** Define the schema for URL state synchronization */
export const NavigatorViewStateSchema = z.object({
  transform: z.object({
    offset: z.object({
      x: z.number().default(0),
      y: z.number().default(0),
    }),
    zoom: z.number().default(1),
  }),
})

/** Infer TypeScript type from Zod schema */
export type NavigatorViewerState = z.infer<typeof NavigatorViewStateSchema>
