/**
 * Title: Navigator View
 * Author: Kobi Schmalenberg with reference to ePlant2
 * Description:
 * The navigator viewer works by fetching data from an API source, which includes information on phylogeny, sequence/expression similarity, etc,
 * and converting it into formats usable by the external package D3. D3 contains a suite of functions/tools that streamline the process of
 * visualizing a phylogeny tree. SVG elements surround the D3 phylogeny tree object to showcase various relevant information to the user.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useOutletContext } from 'react-router-dom'

import { useConfig } from '@eplant/config'
import GeneticElement from '@eplant/GeneticElement'
import arabidopsis from '@eplant/Species/arabidopsis'
import {
  useActiveGeneId,
  useGeneticElements,
  useSetActiveGeneId,
  useSetActiveViewId,
} from '@eplant/state'
import { useURLState } from '@eplant/state/URLStateProvider'
import LoadingPage, {
  LoadingImage,
} from '@eplant/UI/Layout/ViewContainer/LoadingPage'
import { ViewContext } from '@eplant/UI/Layout/ViewContainer/types'
import PanZoom from '@eplant/util/PanZoom'
import { ViewDataError } from '@eplant/View'
import { Box, Typography, useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import CellEFPIcon from './Icons/Nav_CellEFPIcon'
import GeneInfoViewIcon from './Icons/Nav_GeneInfoViewerIcon'
import PlantEFPIcon from './Icons/Nav_PlantEFPIcon'
import * as constants from './Utility/constants'
import { MetadataVisualizations } from './Utility/MetadataVisualizations'
import {
  calculateDimensions,
  ePlantLinks,
  extractSpecies,
  fetchGeneData,
  genomeColors,
  getGenomeColor,
  getGrameneLink,
  newickToD3,
} from './Utility/utils'
import {
  D3Node,
  NavigatorViewerData,
  NavigatorViewerState,
  NavigatorViewStateSchema,
} from './types'
import NavigatorView from '.'

/**
 * Main component for rendering the Navigator View.
 * This component visualizes genetic relationships in a tree/hierarchy structure
 * with interactive elements for exploring gene data.
 *
 * @returns A React component that displays the hierarchical tree visualization
 */
export const NavigatorViewObject = () => {
  /** Get context from parent (geneticElement, plus loading callbacks) */
  const { geneticElement } = useOutletContext<ViewContext>()
  const [loadAmount, setLoadAmount] = useState(0)

  /** Manage URL-synchronized state */
  const { state, setState, initializeState } =
    useURLState<NavigatorViewerState>()

  /** Theme and refs for D3 manipulation */
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement | null>(null)

  /** Handle switching view and gene */
  const [genes, setGenes] = useGeneticElements()
  const setActiveViewId = useSetActiveViewId()
  const setActiveGeneId = useSetActiveGeneId()

  /** Get user views and species */
  const { userViews } = useConfig()

  /** State management for dimensions, gene ID, and species */
  const [dimensions, setDimensions] = useState(calculateDimensions())
  const [primaryGene, setPrimaryGene] = useState<string>('')
  const [species, setSpecies] = useState<string>('')
  const [activeGeneId] = useActiveGeneId()

  /**
   * Load navigator data with React Query.
   * Fetches tree data for the current genetic element.
   */
  const { data, isLoading, isError, error } = useQuery<
    NavigatorViewerData,
    ViewDataError
  >({
    queryKey: [`navigator-view-${geneticElement?.id}`],
    queryFn: async () => {
      return navigatorViewerLoader(geneticElement, setLoadAmount)
    },
    retry: false /** Limit the delay when trying to load invalid data */,
  })

  /**
   * Initialize Navigator view state from URL or defaults on first mount
   */
  useEffect(() => {
    initializeState(NavigatorViewStateSchema)
  }, [initializeState])

  /** Get navigatorData from the returned data */
  const navigatorData = data?.treeData

  /**
   * Extract primary gene ID and species from the API URL when data loads
   */
  useEffect(() => {
    const newGene = activeGeneId
    if (data?.url) {
      setPrimaryGene(newGene)
      setSpecies(extractSpecies(data.url))
    }
  }, [data?.url, data?.treeData, activeGeneId])

  /** Create D3 hierarchy from tree data
   * D3 hierarchy encompasses a number of object types such as Tree, Cluster, Treemap, etc.
   * Using Tree does not yield what is required(leaf nodes aligned vertically).
   * Therefore, this view relies on the Cluster object.
   * Citation: https://d3js.org/d3-hierarchy/cluster
   */
  const hierarchy = useMemo(() => {
    if (!navigatorData || !navigatorData.tree) return null

    try {
      const d3Data = newickToD3(
        navigatorData.tree,
        navigatorData,
        primaryGene,
        species
      )
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
  }, [navigatorData, primaryGene, species])

  /**
   * Update dimensions when hierarchy object changes.
   * Adjusts container height based on the number of leaf nodes.
   */
  useEffect(() => {
    if (!isLoading && navigatorData && hierarchy) {
      try {
        const leafCount = hierarchy.leaves().length
        const newDimensions = calculateDimensions(leafCount)
        setDimensions(newDimensions)

        /** Set the container's minimum height to fit all content */
        if (containerRef.current) {
          containerRef.current.style.minHeight = `${newDimensions.height}px`
        }
      } catch (error) {
        console.error('Error updating dimensions:', error)
      }
    }
  }, [hierarchy, isLoading, navigatorData])

  /**
   * Theme colors for visualization.
   * Defines color scheme based on current theme (light/dark).
   */
  const themeColors = useMemo(
    () => ({
      nodeColor:
        theme.palette.mode === 'dark'
          ? theme.palette.common.white
          : theme.palette.common.black,
      leafNodeColor:
        theme.palette.mode === 'dark'
          ? theme.palette.primary.light
          : theme.palette.primary.light,
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

  /**
   * Generate tree layout using D3's cluster layout.
   * Creates the hierarchical visualization structure with proper positioning.
   */
  const navigator = useMemo(() => {
    if (!dimensions.boundsHeight || !dimensions.boundsWidth || !hierarchy)
      return null

    /** Clear any existing layout data */
    hierarchy.descendants().forEach((node) => {
      delete (node as any).x
      delete (node as any).y
      delete (node as any).parentY
    })

    /** Essentially assigns coordinates for each node*/
    const navigatorGenerator = d3
      .cluster<D3Node>()
      .size([dimensions.boundsHeight * 0.9, dimensions.boundsWidth * 0.2])
      .separation((a, b) =>
        a.parent === b.parent ? 1.5 : 2.5
      ) /** If two nodes share a parent, they are spaced closer together */

    const processedNavigator = navigatorGenerator(hierarchy)

    /** Calculates how much space is actually used by the nodes of a given tree for use in scaling */
    const xExtent = d3.extent(processedNavigator.descendants(), (d) => d.x) as [
      number,
      number,
    ]
    const yExtent = d3.extent(processedNavigator.descendants(), (d) => d.y) as [
      number,
      number,
    ]

    /** Converts raw coordinates into pixel values for placement on the screen */
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

  /**
   * Create tooltip for node information.
   * Sets up D3 tooltip that follows cursor for displaying additional information.
   */
  useEffect(() => {
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
      .style('border-radius', '0px')
      .style('pointer-events', 'none')
      .style('backdrop-filter', 'blur(7px)')

    return () => {
      tooltip.remove()
    }
  }, [])

  /**
   * Helper function to add tooltips to elements.
   * Configures mouseover, move, and mouseout events for an SVG element.
   *
   * @param element - D3 selection for the element receiving the tooltip
   * @param text - Text to display in the tooltip
   */
  const addTooltip = (
    element: d3.Selection<SVGGElement, unknown, null, undefined>,
    text: string
  ) => {
    const tooltip = d3.select('.d3-tooltip')

    element
      .on('mouseover', (event: MouseEvent) => {
        tooltip
          .style('visibility', 'visible')
          .html(text)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden')
      })
      .on('click', () => {
        /** Optionally hide tooltip on click */
        tooltip.style('visibility', 'hidden')
      })
  }

  /**
   * Generate SVG content for the tree visualization.
   * Creates all nodes, edges, labels, and interactive elements.
   *
   * @returns JSX for the complete tree visualization
   */
  const renderTreeContent = () => {
    /** Generate node elements for rendering */
    const allNodes = navigator?.descendants().map((node, index: number) => {
      const isPrimaryGene =
        node.data.name.toUpperCase() === primaryGene.toUpperCase()
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
                  fill={getGenomeColor(
                    node.data.metadata.genome.toUpperCase(),
                    theme.palette.mode === 'dark'
                  )}
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

              {/* World Icon Group */}
              <g
                transform={`translate(${
                  node.y + constants.LABEL_OFFSET * 60
                }, ${node.x - 9})`}
                ref={(el) => {
                  if (el) {
                    addTooltip(d3.select(el), 'World')
                  }
                }}
                onClick={async (event) => {
                  /** Extract the geneName */
                  const geneName = displayName
                  /** Get species from node data or props - default to Arabidopsis */
                  const species = node?.data?.metadata?.genome

                  /** Validate view and gene */
                  const isValidView = userViews.some(
                    (view) => view.id === 'world-efp'
                  )
                  if (!isValidView) {
                    return
                  }

                  /** If there's a known external species link, open it & stop */
                  if (species && species in ePlantLinks) {
                    const url = ePlantLinks[species]
                    window.open(url, '_blank')
                    return
                  }

                  /** Otherwise do the local (Arabidopsis) gene search */
                  const foundGene = await arabidopsis.api.searchGene(geneName)

                  /** If found, set that gene as active */
                  if (foundGene) {
                    /** Check if gene is already loaded */
                    if (!genes.find((g) => g.id === foundGene.id)) {
                      /** Add gene to the list if not already loaded */
                      setGenes([...genes, foundGene])
                    }
                    setActiveGeneId(foundGene.id)
                    /** Now switch to the desired view */
                    setActiveViewId('world-efp')
                  }
                }}
                style={{
                  cursor: userViews.some((view) => view.id === 'world-efp')
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
                    opacity: userViews.some((view) => view.id === 'world-efp')
                      ? 1
                      : 0.5,
                  }}
                >
                  <GeneInfoViewIcon />
                </g>
              </g>

              {/* Plant EFP Icon Group */}
              <g
                transform={`translate(${
                  node.y + constants.LABEL_OFFSET * 63
                }, ${node.x - 9})`}
                ref={(el) => {
                  if (el) {
                    addTooltip(d3.select(el), 'Plant')
                  }
                }}
                onClick={async (event) => {
                  /** Extract the geneName */
                  const geneName = displayName
                  /** Get species from node data or props - default to Arabidopsis */
                  const species = node?.data?.metadata?.genome

                  /** Validate view and gene */
                  const isValidView = userViews.some(
                    (view) => view.id === 'plant-efp'
                  )
                  if (!isValidView) {
                    return
                  }

                  /** If there's a known external species link, open it & stop */
                  if (species && species in ePlantLinks) {
                    const url = ePlantLinks[species]
                    window.open(url, '_blank')
                    return
                  }

                  /** Otherwise do the local (Arabidopsis) gene search */
                  const foundGene = await arabidopsis.api.searchGene(geneName)

                  /** If found, set that gene as active */
                  if (foundGene) {
                    /** Check if gene is already loaded */
                    if (!genes.find((g) => g.id === foundGene.id)) {
                      /** Add gene to the list if not already loaded */
                      setGenes([...genes, foundGene])
                    }
                    setActiveGeneId(foundGene.id)
                    /** Now switch to the desired view */
                    setActiveViewId('plant-efp')
                  }
                }}
                style={{
                  cursor: userViews.some((view) => view.id === 'plant-efp')
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
                    opacity: userViews.some((view) => view.id === 'plant-efp')
                      ? 1
                      : 0.5,
                  }}
                >
                  <PlantEFPIcon />
                </g>
              </g>

              {/* Cell EFP Icon Group */}
              <g
                transform={`translate(${
                  node.y + constants.LABEL_OFFSET * 66
                }, ${node.x - 11})`}
                ref={(el) => {
                  if (el) {
                    addTooltip(d3.select(el), 'Cell')
                  }
                }}
                onClick={async (event) => {
                  /** Extract the geneName */
                  const geneName = displayName
                  /** Get species from node data or props - default to Arabidopsis */
                  const species = node?.data?.metadata?.genome

                  /** Validate view and gene */
                  const isValidView = userViews.some(
                    (view) => view.id === 'cell-efp'
                  )
                  if (!isValidView) {
                    return
                  }

                  /** If there's a known external species link, open it & stop */
                  if (species && species in ePlantLinks) {
                    const url = ePlantLinks[species]
                    window.open(url, '_blank')
                    return
                  }

                  /** Otherwise do the local (Arabidopsis) gene search */
                  const foundGene = await arabidopsis.api.searchGene(geneName)

                  /** If found, set that gene as active */
                  if (foundGene) {
                    /** Check if gene is already loaded */
                    if (!genes.find((g) => g.id === foundGene.id)) {
                      /** Add gene to the list if not already loaded */
                      setGenes([...genes, foundGene])
                    }
                    setActiveGeneId(foundGene.id)
                    /** Now switch to the desired view */
                    setActiveViewId('cell-efp')
                  }
                }}
                style={{
                  cursor: userViews.some((view) => view.id === 'cell-efp')
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
                    opacity: userViews.some((view) => view.id === 'cell-efp')
                      ? 1
                      : 0.5,
                  }}
                >
                  <CellEFPIcon />
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
                onClick={async (event) => {
                  /** Extract the geneName */
                  const geneName = displayName
                  /** Get species from node data or props - default to Arabidopsis */
                  const species = node?.data?.metadata?.genome

                  /** Validate view and gene */
                  const isValidView = userViews.some(
                    (view) => view.id === 'molecule'
                  )
                  if (!isValidView) {
                    return
                  }

                  /** If there's a known external species link, open it & stop */
                  if (species && species in ePlantLinks) {
                    const url = ePlantLinks[species]
                    window.open(url, '_blank')
                    return
                  }

                  /** Otherwise do the local (Arabidopsis) gene search */
                  const foundGene = await arabidopsis.api.searchGene(geneName)

                  /** If found, set that gene as active */
                  if (foundGene) {
                    /** Check if gene is already loaded */
                    if (!genes.find((g) => g.id === foundGene.id)) {
                      /** Add gene to the list if not already loaded */
                      setGenes([...genes, foundGene])
                    }
                    setActiveGeneId(foundGene.id)
                    /** Now switch to the desired view */
                    setActiveViewId('molecule')
                  }
                }}
                style={{
                  cursor: userViews.some((view) => view.id === 'molecule')
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
                    opacity: userViews.some((view) => view.id === 'Molecule')
                      ? 1
                      : 0.5,
                  }}
                >
                  <GeneInfoViewIcon />
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
                onClick={async (event) => {
                  /** Extract the geneName */
                  const geneName = displayName
                  /** Get species from node data or props - default to Arabidopsis */
                  const species = node?.data?.metadata?.genome

                  /** Validate view and gene */
                  const isValidView = userViews.some(
                    (view) => view.id === 'interactions'
                  )
                  if (!isValidView) {
                    return
                  }

                  /** If there's a known external species link, open it & stop */
                  if (species && species in ePlantLinks) {
                    const url = ePlantLinks[species]
                    window.open(url, '_blank')
                    return
                  }

                  /** Otherwise do the local (Arabidopsis) gene search */
                  const foundGene = await arabidopsis.api.searchGene(geneName)

                  /** If found, set that gene as active */
                  if (foundGene) {
                    /** Check if gene is already loaded */
                    if (!genes.find((g) => g.id === foundGene.id)) {
                      /** Add gene to the list if not already loaded */
                      setGenes([...genes, foundGene])
                    }
                    setActiveGeneId(foundGene.id)
                    /** Now switch to the desired view */
                    setActiveViewId('interactions')
                  }
                }}
                style={{
                  cursor: userViews.some((view) => view.id === 'interactions')
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
                    opacity: userViews.some(
                      (view) => view.id === 'Interactions'
                    )
                      ? 1
                      : 0.5,
                  }}
                >
                  <GeneInfoViewIcon />
                </g>
              </g>

              {/* External links for CoGE and Gramene */}
              <g
                transform={`translate(${
                  node.y + constants.LABEL_OFFSET * 80
                }, ${node.x + 5})`}
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
                  style={{
                    cursor: 'pointer',
                    fill: theme.palette.text.primary,
                  }}
                >
                  CoGE
                </text>
              </g>

              <g
                transform={`translate(${
                  node.y + constants.LABEL_OFFSET * 85
                }, ${node.x + 5})`}
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
                  style={{
                    cursor: 'pointer',
                    fill: theme.palette.text.primary,
                  }}
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

    return (
      <svg width={dimensions.width} height={dimensions.height}>
        <g
          transform={`translate(${constants.MARGIN.left}, ${constants.MARGIN.top})`}
        >
          {allEdges}
          {allNodes}
        </g>
      </svg>
    )
  }

  if (isError) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={NavigatorView}
        error={
          ViewDataError.UNSUPPORTED_GENE
        } /** If using ={error} we get a hanging page when loading a gene with no data */
      ></LoadingPage>
    )
  } else if (isLoading && loadAmount < 100) {
    return (
      <LoadingPage
        loadingAmount={loadAmount}
        gene={geneticElement}
        view={NavigatorView}
        error={null}
      ></LoadingPage>
    )
  } else if (!data || !state) return <></>

  /** Render the complete tree visualization */
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingX: 2,
        }}
      >
        <Typography variant='h6'>Navigator View: {primaryGene}</Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: 'calc(100% - 48px)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          overflow: 'hidden',
        }}
      >
        {/* main canvas area */}
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            position: 'relative',
            minHeight: dimensions.height,
            height: '100%',
          })}
          ref={containerRef}
        >
          {/* Use PanZoom component for handling zoom and pan with URL state synchronization */}
          {navigator && (
            <PanZoom
              sx={(theme) => ({
                position: 'absolute',
                top: theme.spacing(0),
                left: theme.spacing(0),
                width: '100%',
                height: '100%',
                zIndex: 0,
              })}
              key={geneticElement?.id}
              transform={state.transform}
              onTransformChange={(transform) => {
                setState({ ...state, transform: transform })
              }}
            >
              {renderTreeContent()}
            </PanZoom>
          )}
        </Box>
      </Box>
    </Box>
  )
}

/**
 * Data loader function for Navigator view.
 * Fetches and processes the tree data for a given genetic element.
 *
 * @param geneticElement - The current genetic element to load data for
 * @param loadEvent - Callback to report loading progress
 * @returns Promise resolving to the navigator viewer data
 * @throws ViewDataError.UNSUPPORTED_GENE if no genetic element is provided
 */
export const navigatorViewerLoader = async (
  geneticElement: GeneticElement | null,
  loadEvent: (loaded: number) => void
): Promise<NavigatorViewerData> => {
  if (!geneticElement) throw ViewDataError.UNSUPPORTED_GENE

  /** Build the API URL */
  const baseUrl =
    'https://bar.utoronto.ca/webservices/eplant_navigator/cgi-bin/eplant_navigator_service.cgi'
  const geneId = geneticElement.id ?? ''
  const speciesName = geneticElement?.species?.name ?? ''

  const apiUrl = geneId
    ? `${baseUrl}?primaryGene=${encodeURIComponent(
        geneId
      )}&species=${encodeURIComponent(
        speciesName
      )}&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape`
    : `${baseUrl}?primaryGene=AT3G24650&species=Arabidopsis&dataset=Developmental&checkedspecies=arabidopsis_poplar_medicago_soybean_rice_barley_maize_potato_tomato_grape`

  /** Fetch and process the data */
  const treeData = await fetchGeneData(apiUrl, loadEvent)

  /** Return the actual tree data */
  return {
    treeData,
    url: apiUrl,
  }
}
