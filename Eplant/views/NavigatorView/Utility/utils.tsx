import { D3Node, TreeData } from '../types'

import * as constants from './constants'

/**
 * Interface representing a cached data entry
 *
 * @param data - The cached data object of type T
 * @param timestamp - Timestamp of when the data was cached (in milliseconds since epoch)
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

/** Global cache for gene data */
const geneDataCache: Record<string, CacheEntry<TreeData>> = {}

/**
 * Fetches data from a given Url and determines if the data already exists in memory
 * Updates the cache if the data is unique and/or the cache timer has expired
 * @param apiUrl - The Url used to access the necessary phylogeny data of a specific gene
 * @returns A json formatted object of the data for use in downstream functions
 */
export const fetchGeneData = async (
  apiUrl: string,
  loadEvent?: (loaded: number) => void
): Promise<TreeData> => {
  /** Update load status if available */
  loadEvent?.(20)

  /** Check if data exists in cache and is still valid */
  const cachedEntry = geneDataCache[apiUrl]
  const currentTime = Date.now()

  if (
    cachedEntry &&
    currentTime - cachedEntry.timestamp < constants.CACHE_DURATION
  ) {
    /** Skip fetch, we have cached data */
    loadEvent?.(100)
    return cachedEntry.data
  }

  /** Fetch new data if not in cache or cache has expired */
  loadEvent?.(40)
  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  loadEvent?.(80)
  const data = await response.json()

  if (data.status !== 'success') {
    throw new Error('Failed to load tree data')
  }

  /** Store in cache */
  geneDataCache[apiUrl] = {
    data,
    timestamp: Date.now(),
  }

  loadEvent?.(100)
  return data

}

/** Static declaration of genome label colors */
export const genomeColors: { [key: string]: string } = {
  SOYBEAN: '#0876FC' /** Light blue */,
  TOMATO: '#FFA500' /** Orange */,
  POTATO: '#808000' /** Olive green */,
  GRAPE: '#808080' /** Grey */,
  MAIZE: '#00FFFF' /** Cyan */,
  BARLEY: '#FFDC00' /** Yellow */,
  RICE: '#008000' /** Green */,
  'M. TRUNCATULA': '#B03060' /** Violet Red */,
  POPLAR: '#20B2AA' /** Sea Green */,
  default: '#000000' /** Default color: black */,
}

/**
 * Converts a Newick format tree string to D3 hierarchy compatible format
 *
 * @param newickString - Tree structure in Newick format (e.g., "(A:0.1,B:0.2,(C:0.3,D:0.4):0.5);")
 * @param metadata - Additional tree metadata including expression data
 * @param primaryGene - Identifier of the primary gene being analyzed
 * @param species - Species name for the primary gene
 * @returns A D3-compatible tree structure
 * @throws Error If the Newick string format is invalid
 *
 * Example:
 * newickToD3("(A:0.1,B:0.2):0.3;", {
 *   efp_links: { A: "linkA", B: "linkB" },
 *   genomes: { A: "SOYBEAN", B: "RICE" },
 *   SCC_values: { A: 0.9, B: -0.2 },
 *   sequence_similarity: { A: 95, B: 88 },
 *   maximum_values: { A: 1.0, B: 1.0 },
 *   tree: "(A:0.1,B:0.2):0.3;"
 * }, "A", "SOYBEAN")
 *
 * Returns:
 * {
 *   name: 'internal',
 *   value: 0.3,
 *   children: [
 *     {
 *       name: 'A',
 *       value: 0.1,
 *       metadata: {
 *         genome: 'SOYBEAN',
 *         efp_link: 'linkA',
 *         scc_value: 0.9,
 *         sequence_similarity: 95
 *       }
 *     },
 *     {
 *       name: 'B',
 *       value: 0.2,
 *       metadata: {
 *         genome: 'RICE',
 *         efp_link: 'linkB',
 *         scc_value: -0.2,
 *         sequence_similarity: 88
 *       }
 *     }
 *   ]
 * }
 */
export function newickToD3(
  newickString: string,
  metadata: TreeData,
  primaryGene: string,
  species: string
): D3Node {
  /** Remove trailing semicolon and whitespace */
  const cleaned = newickString.trim().replace(/;$/, '')

  /**
   * Recursively parses a Newick node string into a D3Node structure
   *
   * @param str - Node string to parse (e.g., "A:0.1" or "(A:0.1,B:0.2)")
   * @returns Parsed D3Node object
   * @throws Error If the node string format is invalid
   */
  function parseNode(str: string): D3Node {
    /** Handle leaf nodes (no children) */
    if (!str.includes('(')) {
      const [name, lengthStr] = str.split(':')
      const cleanName = name.trim()
      const upperName = cleanName.toUpperCase()
      const isPrimaryGene = upperName === primaryGene.toUpperCase()

      return {
        name: cleanName,
        value: parseFloat(lengthStr),
        metadata: {
          genome: (() => {
            const genomeValue = isPrimaryGene
              ? species
              : metadata.genomes[upperName]
            return genomeValue?.toUpperCase() === 'ATHL'
              ? 'ARABIDOPSIS'
              : genomeValue
          })(),
          scc_value: metadata.SCC_values[upperName],
          sequence_similarity: metadata.sequence_similarity[upperName],
          efp_link: metadata.efp_links[upperName],
        },
      }
    }

    /** Handle internal nodes with children */
    const matches = str.match(/\((.*)\)(.*)/)
    if (!matches) throw new Error('Invalid Newick format')

    const [_, childrenStr, remainingStr] = matches
    const children: D3Node[] = []

    /** Buffer string until comma at root level is found */
    let buffer = ''
    /** Maintin nested level */
    let parenthesesCount = 0

    /** Parse child nodes while handling nested parentheses */
    for (const char of childrenStr) {
      if (char === '(') parenthesesCount++
      if (char === ')') parenthesesCount--
      if (char === ',' && parenthesesCount === 0) {
        children.push(parseNode(buffer.trim()))
        buffer = ''
      } else {
        buffer += char
      }
    }
    if (buffer.trim()) children.push(parseNode(buffer.trim()))

    /** Parse node name and branch length */
    const [name, lengthStr] = remainingStr.split(':')

    return {
      name: name || 'internal',
      value: parseFloat(lengthStr),
      children,
    }
  }

  return parseNode(cleaned)
}

/**
 * Calculates dimensions for rendering the tree based on the number of leaf nodes.
 * Ensures the height stays within defined min and max bounds.
 *
 * @param leafCount - Number of leaf nodes in the tree (default is 0)
 * @returns An object with calculated width, height, and drawable bounds
 */
export const calculateDimensions = (leafCount: number = 0) => {
  /** If no leafCount provided, use MIN_HEIGHT as default */
  const requiredHeight =
    leafCount === 0
      ? constants.MIN_HEIGHT
      : Math.max(
          constants.MIN_HEIGHT,
          Math.min(constants.MAX_HEIGHT, leafCount * constants.HEIGHT_PER_NODE)
        )

  return {
    width: constants.DEFAULT_WIDTH,
    height: requiredHeight,
    boundsWidth:
      constants.DEFAULT_WIDTH - constants.MARGIN.left - constants.MARGIN.right,
    boundsHeight:
      requiredHeight - constants.MARGIN.top - constants.MARGIN.bottom,
  }
}

/**
 * Retrieves the color associated with a specific genome type from the predefined color palette
 * @param genomeType - The name of the genome/species to retrieve a color for
 * @param isDarkMode - Whether dark mode is enabled (affects the default color)
 * @returns A color hex code corresponding to the genome type.
 * If the genome type is not found in the color palette, returns the default color.
 */
export const getGenomeColor = (
  genomeType: string,
  isDarkMode: boolean = false
): string => {
  // First check if we have a specific color for this genome type
  if (genomeType && genomeColors[genomeType]) {
    return genomeColors[genomeType]
  }
  return isDarkMode ? '#FFFFFF' : '#000000'
}

/** Static declaration of other ePlant site links for non-Arabidopsis species */
export const ePlantLinks: { [key: string]: string } = {
  POPLAR: 'https://bar.utoronto.ca/eplant_poplar/',
  SOYBEAN: 'https://bar.utoronto.ca/eplant_soybean/',
  'M. TRUNCATULA': 'https://bar.utoronto.ca/eplant_medicago/',
  TOMATO: 'https://bar.utoronto.ca/eplant_tomato/',
  POTATO: 'https://bar.utoronto.ca/eplant_potato/',
  GRAPE: '',
  RICE: 'https://bar.utoronto.ca/eplant_rice/',
  MAIZE: 'https://bar.utoronto.ca/eplant_maize/',
  BARLEY: 'https://bar.utoronto.ca/eplant_barley/',
}

/** Static declaration of Gramene links for different species */
const grameneLinks: { [key: string]: string } = {
  POPLAR:
    'https://ensembl.gramene.org/Populus_trichocarpa/Search/Results?species=Populus_trichocarpa;idx=;q={geneName}',
  SOYBEAN: 'https://ensembl.gramene.org/Glycine_max/Gene/Summary?g={geneName}',
  'M. TRUNCATULA':
    'https://ensembl.gramene.org/Medicago_truncatula/Gene/Summary?g={geneName}',
  TOMATO:
    'https://ensembl.gramene.org/Solanum_lycopersicum/Search/Results?species=Solanum_lycopersicum;idx=;q={geneName}',
  POTATO: '' /** Placeholder for N/A */,
  GRAPE:
    'https://ensembl.gramene.org/Vitis_vinifera/Search/Results?species=Vitis_vinifera;idx=;q={geneName}',
  RICE: 'https://ensembl.gramene.org/Oryza_indica/Search/Results?species=Oryza_indica;idx=;q={geneName}',
  MAIZE:
    'https://ensembl.gramene.org/Zea_mays/Search/Results?species=Zea_mays;idx=;q={geneName}',
  BARLEY:
    'https://ensembl.gramene.org/Hordeum_vulgare/Search/Results?species=Hordeum_vulgare;idx=;q={geneName}',
  default:
    'https://ensembl.gramene.org/Arabidopsis_thaliana/Gene/Summary?g={geneName}',
}

/**
 * Generate Gramene link based on species and gene name
 * @param species - The species name
 * @param geneName - The gene name
 * @returns Formatted Gramene link or empty string if no link available
 */
export const getGrameneLink = (
  species: string | undefined,
  geneName: string
): string => {
  /** Handle undefined species */
  if (!species) {
    return grameneLinks['default'].replace('{geneName}', geneName)
  }

  /** Normalize species name to uppercase */
  const normalizedSpecies = species.toUpperCase()

  /** Get the link template, fallback to default if not found */
  const linkTemplate =
    grameneLinks[normalizedSpecies] || grameneLinks['default']

  /** Special case handling for specific species */
  let processedGeneName = geneName

  /** SOYBEAN: Replace period with underscore */
  if (normalizedSpecies === 'SOYBEAN') {
    processedGeneName = geneName.replace(/\./g, '_')
  }
  /** RICE: Remove underscore */
  if (normalizedSpecies === 'RICE') {
    processedGeneName = geneName.replace(/_/g, '')
  }
  /** MAIZE: Remove everything after underscore */
  if (normalizedSpecies === 'MAIZE') {
    processedGeneName = geneName.split('_')[0]
  }
  /** BARLEY: Only works for MLOC genes */
  if (normalizedSpecies === 'BARLEY' && !geneName.startsWith('MLOC')) {
    return ''
  }

  /** Replace geneName in the template */
  return linkTemplate.replace('{geneName}', processedGeneName)
}

/**
 * Extracts the species name from the API URL
 *
 * @param url - The complete API URL containing query parameters
 * @returns The species name, or an empty string if not found
 *
 * Uses regex to find the species parameter in the URL
 */
export const extractSpecies = (url: string): string => {
  const match = url.match(/species=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}
