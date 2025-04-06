/**
 * Title: Navigator View
 * Author: Kobi Schmalenberg with reference to ePlant2
 * Description:
 * The navigator viewer works by fetching data from an API source, which includes information on phylogeny, sequence/expression similarity, etc,
 * and converting it into formats usable by the external package D3. D3 contains a suite of functions/tools that streamline the process of
 * visualizing a phylogeny tree. SVG elements surround the D3 phylogeny tree object to showcase various relevant information to the user.
 */

import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'

import { useConfig } from '@eplant/config'
import { useActiveGeneId } from '@eplant/state'
import { useTheme } from '@mui/material/styles'

import { LoadingImage } from '../../UI/Layout/ViewContainer/LoadingPage'
import { useViewSwitch } from '../ViewGeneSwitching'

import Nav_CellEFPIcon from './Icons/Nav_CellEFPIcon'
import Nav_GeneInfoViewIcon from './Icons/Nav_GeneInfoViewerIcon' /** Placeholder icon for those that are not yet implemented in ePlant3 */
import Nav_PlantEFPIcon from './Icons/Nav_PlantEFPIcon'
import * as constants from './constants'
import { NavigatorContext, ViewSwitchProvider } from './index'

/** Static declaration of genome label colors */
const genomeColors: { [key: string]: string } = {
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
 * Retrieves the color associated with a specific genome type from the predefined color palette
 * @param genomeType - The name of the genome/species to retrieve a color for
 * @returns A color hex code corresponding to the genome type.
 * If the genome type is not found in the color palette, returns the default color.
 */
const getGenomeColor = (genomeType: string): string => {
  return genomeType && genomeColors[genomeType]
    ? genomeColors[genomeType]
    : genomeColors['default']
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
  POTATO: '', // Placeholder for N/A
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
 * Static declaration of other ePlant site links for non-Arabidopsis species
 */
const ePlantLinks: { [key: string]: string } = {
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

/**
 * Generate Gramene link based on species and gene name
 * @param species - The species name
 * @param geneName - The gene name
 * @returns Formatted Gramene link or empty string if no link available
 */
const getGrameneLink = (
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
function extractSpecies(url: string): string {
  const match = url.match(/species=([^&]+)/)
  return match ? match[1] : ''
}

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
interface TreeData {
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
interface D3Node {
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
function newickToD3(
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
    let buffer = '' /** Buffer string until comma at root level is found */
    let parenthesesCount = 0 /** Maintin nested level */

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
 * Props interface for the MetadataVisualizations component
 *
 * @param x - X coordinate for rendering the visualization
 * @param y - Y coordinate for rendering the visualization
 * @param metadata - Metadata associated with the node
 * @param isPrimaryGene - Whether this node represents the primary gene being analyzed
 * @param themeColors - colouring for the metadata to match ePlant
 * @param isHighestNode - have we hit the node with the highest Y coordinate
 */
interface MetadataVisualizationsProps {
  x: number
  y: number
  metadata: D3Node['metadata']
  isPrimaryGene: boolean
  isHighestNode: boolean
  themeColors: {
    nodeColor: string
    leafNodeColor: string
    rootNodeColor: string
    edgeColor: string
    textColor: string
    metadataBar: {
      background: string
      stroke: string
      indicator: string
      centerLine: string
    }
  }
}

/**
 * Calculates dimensions for rendering the tree based on the number of leaf nodes.
 * Ensures the height stays within defined min and max bounds.
 *
 * @param leafCount - Number of leaf nodes in the tree (default is 0)
 * @returns An object with calculated width, height, and drawable bounds
 */
const calculateDimensions = (leafCount: number = 0) => {
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
 * Component for rendering metadata visualizations next to tree nodes
 * Displays expression similarity and sequence similarity using color-coded bars
 *
 * @param MetadataVisualizationsProps - Follows the structure of the MetadataVisualizationsProps interface defined in this file
 * @param MetadataVisualizationsProps.x - X coordinate for rendering the visualization
 * @param MetadataVisualizationsProps.y - Y coordinate for rendering the visualization
 * @param MetadataVisualizationsProps.metadata - Metadata associated with the node
 * @param MetadataVisualizationsProps.isPrimaryGene - Whether this node represents the primary gene being analyzed
 * @param MetadataVisualizationsProps.themeColors - colouring for the metadata to match ePlant
 * @param MetadataVisualizationsProps.isHighestNode - have we hit the node with the highest Y coordinate
 * @returns JSX element containing metadata visualizations
 */
const MetadataVisualizations = ({
  x,
  y,
  metadata,
  isPrimaryGene,
  themeColors,
  isHighestNode,
}: MetadataVisualizationsProps) => {
  const expressionBarRef = useRef<SVGRectElement>(null)
  const sequenceBarRef = useRef<SVGRectElement>(null)

  if (!metadata) return null

  /** Normalize values to 0-1 range, with primary gene always at 1 */
  const sequenceSimilarity = Math.min(
    isPrimaryGene ? 100 : metadata.sequence_similarity || 0
  )
  const expressionSimilarity = Math.min(
    isPrimaryGene ? 1 : metadata.scc_value || 0,
    1
  )

  /** Clamp expression similarity between -1 and 1 */
  const clampedExpression = Math.max(
    Math.min(isPrimaryGene ? 1 : expressionSimilarity || 0, 1),
    -1
  )

  /** Calculate the width and position of the indicator bar
   * As the code draws expression bar from left -> right, an indicatorX value is used to determine the start point for drawing.
   * If a positive value, indicatorX will be the position of the center(halfWidth).
   * If negative, we offset from the center by the width of the actual expression data(indicatorWidth) and draw towards the center.
   */
  const halfWidth = constants.BAR_WIDTH / 2
  const indicatorWidth = Math.abs(clampedExpression) * halfWidth
  const indicatorX =
    clampedExpression >= 0
      ? halfWidth /** Start from center for positive values */
      : halfWidth - indicatorWidth /** Offset left for negative values */

  return (
    <g
      transform={`translate(${x + constants.LABEL_OFFSET + 50}, ${
        y - constants.BAR_HEIGHT - constants.BAR_SPACING
      })`}
    >
      {/* Expression similarity bar with tooltip */}
      <g
        transform={`translate(125, ${
          constants.BAR_HEIGHT + constants.BAR_SPACING
        })`}
      >
        {/* Conditionally render title and labels only for the highest positioned node */}
        {isHighestNode && (
          <>
            <text
              x={constants.BAR_WIDTH / 2}
              y={-20}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='11px'
              fontWeight='bold'
            >
              Expression Similarity
            </text>
            {/* Expression similarity scale labels */}
            <text
              x={0}
              y={-7}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='10px'
            >
              -1
            </text>
            <text
              x={constants.BAR_WIDTH / 2}
              y={-7}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='10px'
            >
              0
            </text>
            <text
              x={constants.BAR_WIDTH}
              y={-7}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='10px'
            >
              1
            </text>
          </>
        )}
        {/* Background bar */}
        <rect
          ref={expressionBarRef}
          x={0}
          y={0}
          width={constants.BAR_WIDTH}
          height={constants.BAR_HEIGHT}
          fill={themeColors.metadataBar.background}
          stroke={themeColors.metadataBar.stroke}
          strokeWidth={0.5}
        />
        {/* Expression similarity indicator */}
        <rect
          ref={expressionBarRef}
          x={indicatorX}
          y={0}
          width={indicatorWidth}
          height={constants.BAR_HEIGHT}
          fill={(() => {
            if (clampedExpression < 0) {
              const ratio = (clampedExpression + 1) / 1
              return `rgb(${255 * ratio}, ${255 * ratio}, ${
                255 * (1 - ratio)
              })` /** Increase blue, decrease red and yellow */
            } else {
              const ratio = clampedExpression
              return `rgb(255, ${
                255 * (1 - ratio)
              }, 0)` /** Static red and blue, decrease yellow */
            }
          })()}
        />
        {/* Center line separator */}
        <line
          x1={constants.BAR_WIDTH / 2}
          y1={-4}
          x2={constants.BAR_WIDTH / 2}
          y2={constants.BAR_HEIGHT + 4}
          stroke={themeColors.metadataBar.centerLine}
          strokeWidth={2}
        />
        {/* Tooltip bar */}
        <rect
          x={0}
          y={0}
          width={constants.BAR_WIDTH}
          height={constants.BAR_HEIGHT}
          fill='transparent'
          onMouseOver={(event) => {
            const clampedExpression = Math.max(
              Math.min(isPrimaryGene ? 1 : metadata?.scc_value || 0, 1),
              -1
            )
            d3.select('.d3-tooltip')
              .style('visibility', 'visible')
              .html(
                `
                    <div>
                      <div style="font-weight: bold; margin-bottom: 4px;">Expression Similarity</div>
                      <div>Value: ${clampedExpression.toFixed(2)}</div>
                      <div style="font-size: 0.75rem; margin-top: 4px;">
                        Indicates correlation of expression patterns with the primary gene
                      </div>
                    </div>
                  `
              )
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`)
          }}
          onMouseMove={(event) => {
            d3.select('.d3-tooltip')
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`)
          }}
          onMouseOut={() => {
            d3.select('.d3-tooltip').style('visibility', 'hidden')
          }}
        />
      </g>

      {/* Sequence Similarity bar with tooltip */}
      <g
        transform={`translate(0, ${
          constants.BAR_HEIGHT + constants.BAR_SPACING
        })`}
      >
        {/* Conditionally render title and labels only for the highest positioned node */}
        {isHighestNode && (
          <>
            <text
              x={constants.BAR_WIDTH / 2}
              y={-20}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='11px'
              fontWeight='bold'
            >
              Sequence Similarity
            </text>
            {/* Sequence similarity scale labels */}
            <text
              x={0}
              y={-7}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='10px'
            >
              0%
            </text>
            <text
              x={constants.BAR_WIDTH / 2}
              y={-7}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='10px'
            >
              50%
            </text>
            <text
              x={constants.BAR_WIDTH}
              y={-7}
              textAnchor='middle'
              fill={themeColors.textColor}
              fontSize='10px'
            >
              100%
            </text>
          </>
        )}
        {/* Background bar */}
        <rect
          ref={sequenceBarRef}
          x={0}
          y={0}
          width={constants.BAR_WIDTH}
          height={constants.BAR_HEIGHT}
          fill={themeColors.metadataBar.background}
          stroke={themeColors.metadataBar.stroke}
          strokeWidth={0.5}
        />
        {/* Sequence similarity indicator */}
        <rect
          x={0}
          y={0}
          width={sequenceSimilarity}
          height={constants.BAR_HEIGHT}
          fill={themeColors.metadataBar.indicator}
        />
        {/* Tooltip bar */}
        <rect
          x={0}
          y={0}
          width={constants.BAR_WIDTH}
          height={constants.BAR_HEIGHT}
          fill='transparent'
          onMouseOver={(event) => {
            const sequenceSimilarity = Math.min(
              isPrimaryGene ? 100 : metadata?.sequence_similarity || 0
            )
            d3.select('.d3-tooltip')
              .style('visibility', 'visible')
              .html(
                `
                  <div>
                    <div style="font-weight: bold; margin-bottom: 4px;">Sequence Similarity</div>
                    <div>Value: ${sequenceSimilarity.toFixed(1)}%</div>
                    <div style="font-size: 0.75rem; margin-top: 4px;">
                      Percentage of sequence similarity with the primary gene
                    </div>
                  </div>
                `
              )
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`)
          }}
          onMouseMove={(event) => {
            d3.select('.d3-tooltip')
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`)
          }}
          onMouseOut={() => {
            d3.select('.d3-tooltip').style('visibility', 'hidden')
          }}
        />
      </g>
    </g>
  )
}

const geneDataCache: Record<string, CacheEntry<TreeData>> = {}

/**
 * Fetches data from a given Url and determines if the data already exists in memory
 * Updates the cache if the data is unique and/or the cache timer has expired
 *
 * @param apiUrl - The Url used to access the necessary phylogeny data of a specific gene
 * @returns A json formatted object of the data for use in downstream functions
 */
const fetchGeneData = async (apiUrl: string): Promise<TreeData> => {
  /** Check if data exists in cache and is still valid */
  const cachedEntry = geneDataCache[apiUrl]
  const currentTime = Date.now()

  if (
    cachedEntry &&
    currentTime - cachedEntry.timestamp < constants.CACHE_DURATION
  ) {
    return cachedEntry.data
  }

  /** Fetch new data if not in cache or cache has expired */
  const response = await fetch(apiUrl)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = await response.json()

  if (data.status !== 'success') {
    throw new Error('Failed to load tree data')
  }

  /** Store in cache */
  geneDataCache[apiUrl] = {
    data,
    timestamp: currentTime,
  }

  return data
}

/**
 * Custom hook for gene data fetching with basic caching
 *
 * @param apiUrl - The Url used to access the necessary phylogeny data of a specific gene
 * @returns Loading, error, and Tree data states
 */
const useGeneData = (apiUrl: string) => {
  const [data, setData] = useState<TreeData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const fetchedData = await fetchGeneData(apiUrl)
        setData(fetchedData)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred')
        )
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [apiUrl])

  return { data, error, isLoading }
}

/**
 * Main component for rendering the phylogenetic tree navigator
 * Handles data fetching, tree layout, and interactive visualization
 *
 * @returns JSX element containing the complete tree visualization
 */
export const NavigatorViewObject = () => {
  /** Refs for DOM elements and D3 manipulation */
  const containerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const gRef = useRef<SVGGElement | null>(null)
  const theme = useTheme()
  const { switchViewAndGene } = useViewSwitch()
  const { userViews } = useConfig()

  /** Initialize dimensions with default calculation */
  const [dimensions, setDimensions] = useState(calculateDimensions())

  /** Configuration of Colours for Light and Dark Mode */
  const themeColors = useMemo(
    () => ({
      nodeColor:
        theme.palette.mode === 'dark'
          ? theme.palette.common.white
          : theme.palette.common.black,
      leafNodeColor:
        theme.palette.mode === 'dark'
          ? theme.palette.primary.light
          : theme.palette.primary.light /** Same green color currently */,
      rootNodeColor: theme.palette.mode === 'dark' ? '#EE4B2B' : '#EE4B2B',
      edgeColor:
        theme.palette.mode === 'dark'
          ? theme.palette.grey[500]
          : theme.palette.grey[800],
      textColor: theme.palette.text.primary,
      genomeColors:
        theme.palette.mode === 'dark'
          ? (genomeColors.default = '#FFFFFF')
          : (genomeColors.default = '#000000'),
      metadataBar: {
        background:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[800]
            : theme.palette.grey[400],
        stroke:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[600]
            : theme.palette.grey[400],
        indicator:
          theme.palette.mode === 'dark'
            ? theme.palette.common.white
            : theme.palette.common.black,
        centerLine: theme.palette.error.main,
      },
    }),
    [theme.palette.mode]
  )

  /** State management */
  const { apiUrl } = useContext(NavigatorContext)
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [species, setSpecies] = useState<string>(extractSpecies(apiUrl))
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity)

  /** Keep track of current gene to detect changes */
  const prevGeneRef = useRef<string>(activeGeneId)

  /** Use the custom hook for data fetching */
  const { data: treeData, error, isLoading } = useGeneData(apiUrl)

  /** Reset state when API URL changes */
  useEffect(() => {
    const newGene = activeGeneId
    const newSpecies = extractSpecies(apiUrl)

    /** Add more robust validation */
    if (
      newGene &&
      newSpecies &&
      (newGene !== prevGeneRef.current || newSpecies !== species)
    ) {
      /** Ensure data is valid before updating */
      if (treeData && treeData.tree) {
        setActiveGeneId(newGene)
        setSpecies(newSpecies)
        setTransform(d3.zoomIdentity)

        prevGeneRef.current = newGene
      }
    }
  }, [activeGeneId, species, treeData])

  /** Create D3 hierarchy from tree data
   * D3 hierarchy encompasses a number of object types such as Tree, Cluster, Treemap, etc.
   * Using Tree does not yield what is required(leaf nodes aligned vertically).
   * Therefore, this view relies on the Cluster object.
   * Citation: https://d3js.org/d3-hierarchy/cluster
   */
  const hierarchy = useMemo(() => {
    if (!treeData) return null

    try {
      const d3Data = newickToD3(treeData.tree, treeData, activeGeneId, species)
      const newHierarchy = d3.hierarchy(d3Data)

      /** Clear any cached properties - used for when switching between genes*/
      newHierarchy.descendants().forEach((node) => {
        delete (node as any).x0
        delete (node as any).y0
        delete (node as any).parentY
        delete (node as any).previousX
        delete (node as any).previousY
      })

      return newHierarchy
    } catch (error) {
      console.error('Error parsing Newick string:', error)
      return null
    }
  }, [treeData, activeGeneId, species])

  /** Update dimensions when hierarchy object changes */
  useEffect(() => {
    if (!isLoading && treeData && hierarchy) {
      try {
        const leafCount = hierarchy.leaves().length
        const newDimensions = calculateDimensions(leafCount)
        setDimensions(newDimensions)

        if (containerRef.current) {
          containerRef.current.style.height = `${newDimensions.height}px`
        }
      } catch (error) {
        console.error('Error updating dimensions:', error)
      }
    }
  }, [hierarchy, isLoading, treeData])

  /** Generate tree layout using D3's cluster layout */
  const navigator = useMemo(() => {
    if (!dimensions.boundsHeight || !dimensions.boundsWidth || !hierarchy)
      return null

    /** Clear any existing layout data */
    hierarchy.descendants().forEach((node) => {
      delete (node as any).x
      delete (node as any).y
      delete (node as any).parentY
    })

    /** Essentially assigns coordinates for each node.
     * Create the cluster object, sets max size of the object to take 90% of available height and 20% width.
     */
    const navigatorGenerator = d3
      .cluster<D3Node>()
      .size([dimensions.boundsHeight * 0.9, dimensions.boundsWidth * 0.2])
      .separation((a, b) =>
        a.parent === b.parent ? 1.5 : 2.5
      ) /** If two nodes share a parent, they are spaced closer together */

    /** Applies the cluster layout to our hierarchy object */
    const processedNavigator = navigatorGenerator(hierarchy)

    /** Calculates how much space is actually used by the nodes of a given tree for use in scaling
     * Does this by finding the max x and y values of all the nodes(the extent).
     * Helpful in determining the space needed by the nodes.
     */
    const xExtent = d3.extent(processedNavigator.descendants(), (d) => d.x) as [
      number,
      number,
    ]
    const yExtent = d3.extent(processedNavigator.descendants(), (d) => d.y) as [
      number,
      number,
    ]

    /** Converts raw coordinates into pixel values for placement on the screen
     * Scales based on calculated extents within an output range.
     */
    const xScale = d3
      .scaleLinear()
      .domain(xExtent)
      .range([0, dimensions.boundsHeight * 0.9])

    const yScale = d3
      .scaleLinear()
      .domain(yExtent)
      .range([0, dimensions.boundsWidth * 0.2])

    /** Process nodes with fresh coordinates and aligns by leaf node vertically
     * Applies scaling functions onto each node with special leaf node handling.
     * Forced alignment may be redundant here upon further review. (April 4th 2025)
     */
    processedNavigator.descendants().forEach((node) => {
      node.x = xScale(node.x)
      node.y = yScale(node.y)

      if (!node.children) {
        node.y = yScale(yExtent[1])
      } else if (node.children) {
        node.children.forEach((child) => {
          ;(child as any).parentY = node.y
        })
      }
    })

    return processedNavigator
  }, [hierarchy, dimensions.boundsWidth, dimensions.boundsHeight])

  /** Create a single tooltip instance */
  const tooltip = d3
    .select('body')
    .selectAll<HTMLDivElement, unknown>('.d3-tooltip')
    .data([null])
    .join('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', theme.palette.primary.light)
    .style('color', 'white')
    .style('padding', '6px')
    .style('border-radius', '0px') /** Sharp edges */
    .style('pointer-events', 'none')
    .style('backdrop-filter', 'blur(7px)')

  /** Add tooltip to elements */
  const addTooltip = (
    element: d3.Selection<SVGGElement, unknown, null, undefined>,
    text: string
  ) => {
    let isHidden = false
    element
      .on('mouseover', (event: MouseEvent) => {
        if (!isHidden) {
          tooltip
            .style('visibility', 'visible')
            .html(text)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
        }
      })
      .on('mousemove', (event: MouseEvent) => {
        if (!isHidden) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
        }
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden')
      })

    /** Reactivate the tooltip on hover */
    tooltip.on('mouseover', () => {
      isHidden = false /** Reset the hidden state */
    })
  }

  /** Generate node elements for rendering */
  const allNodes = navigator?.descendants().map((node, index: number) => {
    const isPrimaryGene =
      node.data.name.toUpperCase() === activeGeneId.toUpperCase()
    let displayName = node.data.name
    const isHighestNode =
      node.x === Math.min(...navigator.descendants().map((d) => d.y))

    /** Add genome information to leaf node labels */
    if (!node.children && node.data.metadata?.genome) {
      displayName = `${node.data.name}`
    }
    const uniqueKey = `${node.data.name}-${index}`

    return (
      <g key={uniqueKey} className='node'>
        {/* Node circle: only draw for leaf and root nodes*/}
        {(!node.children || node === navigator) && (
          <circle
            cx={node.y}
            cy={node.x}
            r={constants.NODE_RADIUS}
            fill={
              node === navigator
                ? themeColors.rootNodeColor
                : isPrimaryGene
                  ? themeColors.nodeColor
                  : themeColors.leafNodeColor
            }
            stroke='none'
          />
        )}
        {/* Label and metadata for leaf nodes */}
        {!node.children && (
          <>
            {/* Node label with optional genome information */}
            <text
              x={node.y + constants.LABEL_OFFSET}
              y={node.x}
              fontSize={12}
              textAnchor='start'
              dominantBaseline='middle'
              fontWeight={isPrimaryGene ? 'bold' : 'normal'}
              fill={themeColors.textColor}
            >
              {displayName.toUpperCase()}
            </text>
            {/* Genome label aligned in its own column */}
            {!node.children && node.data.metadata?.genome && (
              <text
                x={node.y + constants.LABEL_OFFSET * 25}
                y={node.x}
                fontSize={12}
                textAnchor='end'
                dominantBaseline='middle'
                fontWeight={'bold'}
                fill={getGenomeColor(node.data.metadata.genome.toUpperCase())}
              >
                {node.data.metadata.genome.toUpperCase()}
              </text>
            )}

            {/* Metadata visualization component for expression and similarity data */}
            <MetadataVisualizations
              x={node.y + constants.LABEL_OFFSET * 25}
              y={node.x - 7}
              metadata={node.data.metadata}
              isPrimaryGene={isPrimaryGene}
              themeColors={themeColors}
              isHighestNode={isHighestNode}
            />

            {/* Placeholder World Icon Group */}
            <g
              transform={`translate(${node.y + constants.LABEL_OFFSET * 60}, ${
                node.x - 9
              })`}
              ref={(el) => {
                if (el) {
                  addTooltip(d3.select(el), 'World')
                }
              }}
              onClick={(event) => {
                /** Extract the geneName */
                const geneName = displayName
                /** Get species from node data or props - default to Arabidopsis */
                const species = node.data.metadata?.genome

                /** Validate view and gene */
                const isValidView = userViews.some(
                  (view) => view.id === 'world'
                )

                if (isValidView) {
                  /** Call switch view function with species information */
                  if (!species || !(species in ePlantLinks)) {
                    /** Call switch view function to swap the view using designated view id and gene name */
                    switchViewAndGene('world', geneName)
                  } else {
                    /** Handle external species navigation */
                    switchViewAndGene('world', geneName, ePlantLinks[species])
                  }
                }
              }}
              style={{
                cursor: userViews.some((view) => view.id === 'world')
                  ? 'pointer'
                  : 'not-allowed',
              }}
            >
              <rect
                width={16}
                height={16}
                fill='transparent'
                style={{ cursor: 'pointer' }}
              />
              <g
                style={{
                  pointerEvents: 'none',
                  opacity: userViews.some((view) => view.id === 'world')
                    ? 1
                    : 0.5,
                }}
              >
                <Nav_GeneInfoViewIcon />
              </g>
            </g>

            {/* Plant EFP Icon Group */}
            <g
              transform={`translate(${node.y + constants.LABEL_OFFSET * 63}, ${
                node.x - 9
              })`}
              ref={(el) => {
                if (el) {
                  addTooltip(d3.select(el), 'Plant')
                }
              }}
              onClick={async (event) => {
                /** Extract the geneName */
                const geneName = displayName
                /** Get species from node data or props - default to Arabidopsis */
                const species = node.data.metadata?.genome

                /** Validate view and gene */
                const isValidView = userViews.some(
                  (view) => view.id === 'plant'
                )

                if (isValidView) {
                  /** Call switch view function with species information */
                  if (!species || !(species in ePlantLinks)) {
                    /** Call switch view function to swap the view using designated view id and gene name */
                    switchViewAndGene('plant', geneName)
                  } else {
                    /** Handle external species navigation */
                    switchViewAndGene('plant', geneName, ePlantLinks[species])
                  }
                }
              }}
              style={{
                cursor: userViews.some((view) => view.id === 'plant')
                  ? 'pointer'
                  : 'not-allowed',
              }}
            >
              <rect
                width={16}
                height={16}
                fill='transparent'
                style={{ cursor: 'pointer' }}
              />
              <g
                style={{
                  pointerEvents: 'none',
                  opacity: userViews.some((view) => view.id === 'plant')
                    ? 1
                    : 0.5,
                }}
              >
                <Nav_PlantEFPIcon />
              </g>
            </g>

            {/* Cell EFP Icon Group */}
            <g
              transform={`translate(${node.y + constants.LABEL_OFFSET * 66}, ${
                node.x - 11
              })`}
              ref={(el) => {
                if (el) {
                  addTooltip(d3.select(el), 'Cell')
                }
              }}
              onClick={(event) => {
                /** Extract the geneName */
                const geneName = displayName
                /** Get species from node data or props - default to Arabidopsis */
                const species = node.data.metadata?.genome

                /** Validate view and gene */
                const isValidView = userViews.some(
                  (view) => view.id === 'Cell eFP'
                )

                if (isValidView) {
                  /** Call switch view function with species information */
                  if (!species || !(species in ePlantLinks)) {
                    /** Call switch view function to swap the view using designated view id and gene name */
                    switchViewAndGene('Cell eFP', geneName)
                  } else {
                    /** Handle external species navigation */
                    switchViewAndGene(
                      'Cell eFP',
                      geneName,
                      ePlantLinks[species]
                    )
                  }
                }
              }}
              style={{
                cursor: userViews.some((view) => view.id === 'Cell eFP')
                  ? 'pointer'
                  : 'not-allowed',
              }}
            >
              <rect
                width={20}
                height={20}
                fill='transparent'
                style={{ cursor: 'pointer' }}
              />
              <g
                style={{
                  pointerEvents: 'none',
                  opacity: userViews.some((view) => view.id === 'Cell eFP')
                    ? 1
                    : 0.5,
                }}
              >
                <Nav_CellEFPIcon />
              </g>
            </g>

            {/* Placeholder Molecule Icon Group */}
            <g
              transform={`translate(${
                node.y + constants.LABEL_OFFSET * 69 + 8
              }, ${node.x - 9})`}
              ref={(el) => {
                if (el) {
                  addTooltip(d3.select(el), 'Molecule')
                }
              }}
              onClick={(event) => {
                /** Extract the geneName */
                const geneName = displayName
                /** Get species from node data or props - default to Arabidopsis */
                const species = node.data.metadata?.genome

                /** Validate view and gene */
                const isValidView = userViews.some(
                  (view) => view.id === 'Molecule'
                )

                if (isValidView) {
                  /** Call switch view function with species information */
                  if (!species || !(species in ePlantLinks)) {
                    /** Call switch view function to swap the view using designated view id and gene name */
                    switchViewAndGene('Molecule', geneName)
                  } else {
                    /** Handle external species navigation */
                    switchViewAndGene(
                      'Molecule',
                      geneName,
                      ePlantLinks[species]
                    )
                  }
                }
              }}
            >
              <rect
                width={16}
                height={16}
                fill='transparent'
                style={{ cursor: 'pointer' }}
              />
              <g
                style={{
                  pointerEvents: 'none',
                  opacity: userViews.some((view) => view.id === 'Molecule')
                    ? 1
                    : 0.5,
                }}
              >
                <Nav_GeneInfoViewIcon />
              </g>
            </g>

            {/* Placeholder Interactions Icon Group */}
            <g
              transform={`translate(${
                node.y + constants.LABEL_OFFSET * 72 + 8
              }, ${node.x - 9})`}
              ref={(el) => {
                if (el) {
                  addTooltip(d3.select(el), 'Interactions')
                }
              }}
              onClick={(event) => {
                /** Extract the geneName */
                const geneName = displayName
                /** Get species from node data or props - default to Arabidopsis */
                const species = node.data.metadata?.genome

                /** Validate view and gene */
                const isValidView = userViews.some(
                  (view) => view.id === 'Interactions'
                )

                if (isValidView) {
                  /** Call switch view function with species information */
                  if (!species || !(species in ePlantLinks)) {
                    /** Call switch view function to swap the view using designated view id and gene name */
                    switchViewAndGene('Interactions', geneName)
                  } else {
                    /** Handle external species navigation */
                    switchViewAndGene(
                      'Interactions',
                      geneName,
                      ePlantLinks[species]
                    )
                  }
                }
              }}
            >
              <rect
                width={16}
                height={16}
                fill='transparent'
                style={{ cursor: 'pointer' }}
              />
              <g
                style={{
                  pointerEvents: 'none',
                  opacity: userViews.some((view) => view.id === 'Interactions')
                    ? 1
                    : 0.5,
                }}
              >
                <Nav_GeneInfoViewIcon />
              </g>
            </g>

            {/* CoGE */}
            <g
              transform={`translate(${node.y + constants.LABEL_OFFSET * 80}, ${
                node.x + 5
              })`}
              ref={(el) => {
                if (el) {
                  addTooltip(d3.select(el), 'Open gene page on CoGE')
                }
              }}
              onClick={() => {
                const url = `https://genomevolution.org/CoGe/`
                window.open(url, '_blank')
              }}
            >
              <text
                style={{ cursor: 'pointer', fill: theme.palette.text.primary }}
              >
                CoGE
              </text>
            </g>

            {/* Gramene */}
            <g
              transform={`translate(${node.y + constants.LABEL_OFFSET * 85}, ${
                node.x + 5
              })`}
              ref={(el) => {
                if (el) {
                  addTooltip(d3.select(el), 'Open gene page on Gramene')
                }
              }}
              onClick={() => {
                const url = getGrameneLink(
                  node.data.metadata?.genome,
                  node.data.name
                )
                window.open(url, '_blank')
              }}
            >
              <text
                style={{ cursor: 'pointer', fill: theme.palette.text.primary }}
              >
                Gramene
              </text>
            </g>
          </>
        )}
      </g>
    )
  })

  /** Generate edge elements for rendering */
  const allEdges = navigator?.links().map((link, index: number) => {
    /** Create an elbow-shaped path for each edge using SVG path commands:
     * M: Move to starting point (source node, the midpoint of both leaf nodes)
     * H: Draw horizontal line to parent's x-coordinate(the code shows y-coordinate as they are flipped)
     * V: Draw vertical line to target's y-coordinate(the code shows x-coordinate as they are flipped)
     * H: Draw horizontal line to target node
     */
    const sourceX = link.source.x
    const sourceY = link.source.y
    const targetX = link.target.x
    const targetY = link.target.y
    const parentY = (link as any).target.parentY ?? link.source.y
    const path = `
      M${sourceY},${sourceX}
      H${parentY}
      V${targetX}
      H${targetY}
    `

    const uniqueKey = `${link.source.data.name}-${link.target.data.name}-${index}`

    return (
      <path
        key={uniqueKey}
        fill='none'
        stroke={themeColors.edgeColor}
        strokeWidth={1}
        d={path}
      />
    )
  })

  /** Render the complete tree visualization */
  return (
    <div className='flex flex-col w-full'>
      {!isLoading && (
        <div className='w-full px-4 py-0 flex items-center'>
          <h2 className='text-lg font-bold text-gray-800 flex-1'>
            Navigator View: {activeGeneId}
          </h2>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: constants.DEFAULT_WIDTH,
          height: calculateDimensions().boundsHeight,
          overflow: 'hidden' /** Prevent scrolling outside container */,
        }}
      >
        {/* Conditional loading animation */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'inherit',
              zIndex: 10 /** Ensure it's above the SVG content */,
            }}
          >
            <LoadingImage
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
              }}
            />
          </div>
        )}

        {/* Error message when no data is available */}
        {!isLoading &&
          (!allEdges || allEdges.length === 0) &&
          (!allNodes || allNodes.length === 0) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                color: 'red',
                fontSize: '1.2rem',
              }}
            >
              <p>No data available for the selected gene.</p>
            </div>
          )}

        {/* Main SVG container for the tree visualization */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ cursor: 'grab' }}
        >
          {/* Group element for tree content with transformation support
              1. Translate to account for margins
              2. Scale by zoom factor (transform.k)
              3. Translate by pan offset (transform.x, transform.y)*/}
          <g
            ref={gRef}
            transform={`translate(${constants.MARGIN.left}, ${constants.MARGIN.top}) scale(${transform.k}) translate(${transform.x}, ${transform.y})`}
          >
            {/* Render tree edges first so they appear behind nodes */}
            {allEdges}
            {/* Render tree nodes and their labels on top */}
            {allNodes}
          </g>
        </svg>
      </div>
    </div>
  )
}

const WrappedNavigatorViewObject = () => {
  return (
    <ViewSwitchProvider>
      <NavigatorViewObject />
    </ViewSwitchProvider>
  )
}

export default WrappedNavigatorViewObject
