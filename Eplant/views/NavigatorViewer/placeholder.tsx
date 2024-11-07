import { useContext, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import * as d3 from "d3";

import { useTheme } from '@mui/material/styles';

import { NavigatorContext } from './index';

/** Margin configuration for the SVG container */
const MARGIN = { top: 50, right: 400, bottom: 50, left: 50 };

/** Default width of the visualization container in pixels */
const DEFAULT_WIDTH = 1200;

/** Default height of the visualization container in pixels */
const DEFAULT_HEIGHT = 600;

/** Width of metadata visualization bars in pixels */
const BAR_WIDTH = 100;

/** Height of metadata visualization bars in pixels */
const BAR_HEIGHT = 12;

/** Vertical spacing between bars in pixels */
const BAR_SPACING = 2;

/** Horizontal offset for text labels from nodes in pixels */
const LABEL_OFFSET = 10;

/** Radius of tree nodes in pixels */
const NODE_RADIUS = 4;

/** Minimum zoom constraint*/
const MIN_ZOOM = 0.5;

/** Maximum zoom constraint*/
const MAX_ZOOM = 3;

/** Maximum x value of the tree(leafs) */
let maxY = 0;

/**
 * Extracts the primary gene identifier from the API URL
 * 
 * @param url - The complete API URL containing query parameters
 * @returns The primary gene identifier, or an empty string not found
 * 
 * Uses regex to find the primaryGene parameter in the URL
 */
function extractPrimaryGene(url: string): string {
  const match = url.match(/primaryGene=([^&]+)/);
  return match ? match[1] : "";
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
  const match = url.match(/species=([^&]+)/);
  return match ? match[1] : "";
}

/**
  * Interface representing the tree data structure received from the API
  * 
  * @var tree - Newick format string representing the phylogenetic tree 
  * @var efp_links - Map of gene identifiers to their expression profile URLs
  * @var genomes - Map of gene identifiers to their genome information
  * @var SCC_values - Map of gene identifiers to their expression correlation values
  * @var sequence_similarity - Map of gene identifiers to their sequence similarity scores
  * @var maximum_values - Map of gene identifiers to their maximum normalized values
*/
interface TreeData {
  tree: string;
  efp_links: Record<string, string>;
  genomes: Record<string, string>;
  SCC_values: Record<string, number>;
  sequence_similarity: Record<string, number>;
  maximum_values: Record<string, number>;
}

/**
 * Interface representing a node in the D3 hierarchy structure
 * 
 * @var name - Node identifier or name
 * @var value - Optional numerical value representing branch length
 * @var children - Optional array of child nodes in the tree
 * @var metadata - Optional metadata associated with the node
 */
interface D3Node {
  name: string;
  value?: number;
  children?: D3Node[];
  metadata?: {
    genome?: string;
    scc_value?: number;
    sequence_similarity?: number;
    efp_link?: string;
  };
}

/**
 * Converts a Newick format tree string to D3 hierarchy compatible format
 * 
 * @param newickString - Tree structure in Newick format (e.g., "(A:0.1,B:0.2,(C:0.3,D:0.4):0.5);")
 * @param metadata - Additional tree metadata including expression data
 * @param primaryGene - Identifier of the primary gene being analyzed
 * @param species - Species name for the primary gene
 * @returns A D3-compatible tree structure
 * @throws {Error} If the Newick string format is invalid
 */
function newickToD3(newickString: string, metadata: TreeData, primaryGene: string, species: string): D3Node {
  /** Remove trailing semicolon and whitespace */
  const cleaned = newickString.trim().replace(/;$/, "");
  
  /**
   * Recursively parses a Newick node string into a D3Node structure
   * 
   * @param str - Node string to parse (e.g., "A:0.1" or "(A:0.1,B:0.2)")
   * @returns Parsed D3Node object
   * @throws {Error} If the node string format is invalid
   */
  function parseNode(str: string): D3Node {
    // Handle leaf nodes (no children)
    if (!str.includes("(")) {
      const [name, lengthStr] = str.split(":");
      const cleanName = name.trim();
      const upperName = cleanName.toUpperCase();
      const isPrimaryGene = upperName === primaryGene.toUpperCase();
      
      return {
        name: cleanName,
        value: lengthStr ? parseFloat(lengthStr) : undefined,
        metadata: {
          genome: isPrimaryGene ? species : metadata.genomes[upperName],
          scc_value: metadata.SCC_values[upperName],
          sequence_similarity: metadata.sequence_similarity[upperName],
          efp_link: metadata.efp_links[upperName]
        }
      };
    }

    /** Handle internal nodes with children */ 
    const matches = str.match(/\((.*)\)(.*)/);
    if (!matches) throw new Error("Invalid Newick format");
    
    const [_, childrenStr, remainingStr] = matches;
    const children: D3Node[] = [];
    let buffer = ""; /** Buffer string until comma at root level is found */
    let parenthesesCount = 0; /** Maintin nested level */

    /** Parse child nodes while handling nested parentheses */
    for (const char of childrenStr) {
      if (char === "(") parenthesesCount++;
      if (char === ")") parenthesesCount--;
      if (char === "," && parenthesesCount === 0) {
        children.push(parseNode(buffer.trim()));
        buffer = "";
      } else {
        buffer += char;
      }
    }
    if (buffer.trim()) children.push(parseNode(buffer.trim()));

    /** Parse node name and branch length */
    const [name, lengthStr] = remainingStr.split(":");
    
    return {
      name: name || "internal",
      value: lengthStr ? parseFloat(lengthStr) : undefined,
      children
    };
  }

  return parseNode(cleaned);
}

/**
 * Props interface for the MetadataVisualizations component
 * 
 * @var x - X coordinate for rendering the visualization
 * @var y - Y coordinate for rendering the visualization
 * @var metadata - Metadata associated with the node
 * @var isPrimaryGene - Whether this node represents the primary gene being analyzed
 * @var themeColors - colouring for the metadata to match ePlant
 * @var isHighestY - have we hit the node with the highest Y coordinate
 */
interface MetadataVisualizationsProps {
  x: number;
  y: number;
  metadata: D3Node['metadata'];
  isPrimaryGene: boolean;
  isHighestNode: boolean;
  themeColors: {
    nodeColor: string;
    secondaryNodeColor: string;
    edgeColor: string;
    textColor: string;
    metadataBar: {
      background: string;
      stroke: string;
      indicator: string;
      negativeIndicator: string;
      centerLine: string;
    };
  };
}

/**
 * Component for rendering metadata visualizations next to tree nodes
 * Displays expression level and sequence similarity using color-coded bars
 * 
 * @param props - Component properties
 * @returns JSX element containing metadata visualizations
 */
const MetadataVisualizations = ({ 
  x, 
  y, 
  metadata,
  isPrimaryGene,
  themeColors,
  isHighestNode
}: MetadataVisualizationsProps) => {
  if (!metadata) return null;


  /** Normalize values to 0-1 range, with primary gene always at 1 */
  const sequenceSimilarity = Math.min(isPrimaryGene ? 100 : (metadata.sequence_similarity || 0));
  const expressionLevel = Math.min(isPrimaryGene ? 1 : (metadata.scc_value || 0), 1);
  
  // Clamp expression level between -1 and 1
  const clampedExpression = Math.max(Math.min(isPrimaryGene ? 1 : (expressionLevel || 0), 1), -1);
  
  // Calculate the width and position of the indicator bar
  const halfWidth = BAR_WIDTH / 2;
  const indicatorWidth = Math.abs(clampedExpression) * halfWidth;
  const indicatorX = clampedExpression >= 0 
    ? halfWidth  // Start from center for positive values
    : halfWidth - indicatorWidth;  // Offset left for negative values
  
    return (
      <g transform={`translate(${x + LABEL_OFFSET + 50}, ${y - BAR_HEIGHT - BAR_SPACING})`}>
        {/* Expression level bar */}
        <g transform={`translate(0, ${BAR_HEIGHT + BAR_SPACING})`}>
          {/* Conditionally render title only for the highest positioned node */}
          {isHighestNode && (
            <text
              x={BAR_WIDTH / 2}
              y={-10}
              textAnchor="middle"
              fill={themeColors.textColor}
              fontSize="12px"
              fontWeight="bold"
            >
              Expression Level
            </text>
          )}
          {/* Background bar */}
          <rect
            x={0}
            y={0}
            width={BAR_WIDTH}
            height={BAR_HEIGHT}
            fill={themeColors.metadataBar.background}
            stroke={themeColors.metadataBar.stroke}
            strokeWidth={0.5}
          />
          {/* Expression level indicator */}
          <rect
            x={indicatorX}
            y={0}
            width={indicatorWidth}
            height={BAR_HEIGHT}
            fill={clampedExpression >= 0 
              ? themeColors.metadataBar.indicator 
              : themeColors.metadataBar.negativeIndicator}
          />
          {/* Center line separator */}
          <line
            x1={BAR_WIDTH / 2}
            y1={-1}
            x2={BAR_WIDTH / 2}
            y2={BAR_HEIGHT + 1}
            stroke={themeColors.metadataBar.centerLine}
            strokeWidth={1}
          />
        </g>
      {/* Sequence Similarity bar */}
      <g transform={`translate(120, ${BAR_HEIGHT + BAR_SPACING})`}>
        {/* Conditionally render title only for the highest positioned node */}
        {isHighestNode && (
            <text
              x={BAR_WIDTH / 2}
              y={-10}
              textAnchor="middle"
              fill={themeColors.textColor}
              fontSize="12px"
              fontWeight="bold"
            >
              Sequence Similarity
            </text>
          )}
        {/* Background bar */}
        <rect
          x={0}
          y={0}
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          fill={themeColors.metadataBar.background}
          stroke={themeColors.metadataBar.stroke}
          strokeWidth={0.5}
        />
        {/* Sequence similarity indicator */}
        <rect
          x={0}
          y={0}
          width={(sequenceSimilarity)}
          height={BAR_HEIGHT}
          fill={themeColors.metadataBar.indicator}
        />
      </g>
    </g>
  );
};

/**
 * Main component for rendering the phylogenetic tree navigator
 * Handles data fetching, tree layout, and interactive visualization
 * 
 * @returns JSX element containing the complete tree visualization
 */
export const NavigatorViewObject = () => {
  /** Refs for DOM elements and D3 manipulation */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const theme = useTheme();

  /** Configuration of Colours for Light and Dark Mode */
  const themeColors = useMemo(() => ({
    nodeColor: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    secondaryNodeColor: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#69b3a2',
    edgeColor: theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[800],
    textColor: theme.palette.text.primary,
    metadataBar: {
      background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
      stroke: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400],
      indicator: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
      negativeIndicator: theme.palette.mode === 'dark' ? "#FF0000": "#FF0000",
      centerLine: theme.palette.error.main
    }
  }), [theme.palette.mode]);

  
  /** State management */
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { apiUrl } = useContext(NavigatorContext);
  const [primaryGene, setPrimaryGene] = useState<string>(extractPrimaryGene(apiUrl));
  const [species, setSpecies] = useState<string>(extractSpecies(apiUrl));
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  /** Dimensions state for responsive layout */
  const [dimensions, setDimensions] = useState({ 
    width: DEFAULT_WIDTH, 
    height: DEFAULT_HEIGHT,
    boundsWidth: DEFAULT_WIDTH - MARGIN.left - MARGIN.right,
    boundsHeight: DEFAULT_HEIGHT - MARGIN.top - MARGIN.bottom
  });

  /** Update primary gene and species when API URL changes */
  useEffect(() => {
    setPrimaryGene(extractPrimaryGene(apiUrl));
    setSpecies(extractSpecies(apiUrl));
  }, [apiUrl]); /** Triggers updates based on apiUrl, similar to other components later */

  useEffect(() => {
    /**
     * Fetches tree data from the API
     * 
     * @throws {Error} If the network request fails
     */
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (data.status === "success") {
          setTreeData(data);
          setError(null);
        } else {
          setError("Failed to load tree data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }
    };
    fetchData();


    /** Cleanup function to reset state and clear SVG */
    return () => {
      setTreeData(null);
      setError(null);
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [apiUrl]);

  /** Create D3 hierarchy from tree data */
  const hierarchy = useMemo(() => {
    if (!treeData) return null;
    try {
      const d3Data = newickToD3(treeData.tree, treeData, primaryGene, species);
      const hierarchyData = d3.hierarchy(d3Data);
      
      /** Sort nodes alphabetically by leaf names */
      hierarchyData.sort((a, b) => {
        const aName = a.leaves()[0]?.data.name || '';
        const bName = b.leaves()[0]?.data.name || '';
        return bName.localeCompare(aName);
      });
      
      return hierarchyData;
    } catch (error) {
      console.error("Error parsing Newick string:", error);
      return null;
    }
  }, [treeData, primaryGene, species]);

  /** Generate tree layout using D3's cluster layout */
  const navigator = useMemo(() => {
    if (!dimensions.boundsHeight || !dimensions.boundsWidth || !hierarchy) return null;

    /** Create cluster layout with specified dimensions */
    const navigatorGenerator = d3
      .cluster<D3Node>()
      .size([dimensions.boundsHeight * 0.8, dimensions.boundsWidth * 0.4])
      .separation(() => 1);

    const processedNavigator = navigatorGenerator(hierarchy);
    
    /** Calculate maximum x-coordinate for consistent layout */
    const maxX = Math.max(...processedNavigator.descendants().map(d => d.y));
    maxY = Math.min(...processedNavigator.descendants().map(d => d.x));

    /** Adjust node positions for better visualization */
    processedNavigator.descendants().forEach(node => {
      if (!node.children) {
        /** Leaf nodes aligned at maximum x */
        node.y = maxX;
      } else {
        /** Internal nodes positioned based on depth */
        const depthRatio = node.depth / processedNavigator.height;
        node.y = maxX * depthRatio;

        /** Store parent y-coordinate for edge drawing */
        node.children.forEach(child => {
          (child as any).parentY = node.y;
        });
      }
    });

    return processedNavigator;
  }, [hierarchy, dimensions.boundsWidth, dimensions.boundsHeight]);

  /** Error handling */
  if (error) {
    return <div className="error-message" style={{ color: themeColors.textColor }}>Error: {error}</div>;
  }

  /** Loading state */
  if (!treeData || !hierarchy || !dimensions.width || !navigator) {
    return null;
  }

  /** Generate node elements for rendering */
  const allNodes = navigator.descendants().map((node) => {
    const isPrimaryGene = node.data.name.toUpperCase() === primaryGene.toUpperCase();
    let displayName = node.data.name;
    const isHighestNode = node.x === maxY;
    console.log("Node data:", node);
    console.log("maxY:", maxY);
    
    /** Add genome information to leaf node labels */
    if (!node.children && node.data.metadata?.genome) {
      displayName = `${node.data.name} (${node.data.metadata.genome})`;
    }
    
    return (
      <g key={node.data.name} className="node">
        {/* Node circle */}
        <circle
          cx={node.y}
          cy={node.x}
          r={NODE_RADIUS}
          fill={isPrimaryGene ? themeColors.nodeColor : themeColors.secondaryNodeColor}
          stroke="none"
        />
        {/* Label and metadata for leaf nodes */}
        {!node.children && (
          <>
            {/* Node label with optional genome information */}
            <text
              x={node.y + LABEL_OFFSET}
              y={node.x}
              fontSize={12}
              textAnchor="start"
              dominantBaseline="middle"
              fontWeight={isPrimaryGene ? "bold" : "normal"}
              fill={themeColors.textColor}
            >
              {displayName}
            </text>
            {/* Metadata visualization component for expression and similarity data */}
            <MetadataVisualizations
              x={node.y + LABEL_OFFSET * 20}
              y={node.x - 7}
              metadata={node.data.metadata}
              isPrimaryGene={isPrimaryGene}
              themeColors={themeColors}
              isHighestNode={isHighestNode}
            />
          </>
        )}
      </g>
    );
  });

  /** Generate edge elements for rendering */
  const allEdges = navigator.links().map((link) => {
    /** Create an elbow-shaped path for each edge using SVG path commands:
    * M: Move to starting point (source node)
    * H: Draw horizontal line to parent's y-coordinate
    * V: Draw vertical line to target's x-coordinate
    * H: Draw horizontal line to target node 
    */
    const path = `
      M${link.source.y},${link.source.x}
      H${(link as any).target.parentY}
      V${link.target.x}
      H${link.target.y}
    `;

    return (
      <path
        key={`${link.source.data.name}-${link.target.data.name}`}
        fill="none"
        stroke="#999"
        strokeWidth={1}
        d={path}
      />
    );
  });

  /** Render the complete tree visualization */
  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-4 py-0 flex items-center">
        {/* Main title */}
        <h2 className="text-lg font-bold text-gray-00 flex-1">
          Navigator View: {primaryGene}
        </h2>
      </div>
      <div 
        ref={containerRef} 
        style={{ 
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          overflow: 'hidden' /** Prevent scrolling outside container */
        }}
      >
        {/* Main SVG container for the tree visualization */}
        <svg 
          ref={svgRef}
          width={dimensions.width} 
          height={dimensions.height}
          style={{ cursor: "grab"}}
        >
        {/* Group element for tree content with transformation support 
            Apply zoom and pan transformations:
              1. Translate to account for margins
              2. Scale by zoom factor (transform.k)
              3. Translate by pan offset (transform.x, transform.y)*/}
          <g 
            ref={gRef}
            transform={`translate(${MARGIN.left}, ${MARGIN.top}) scale(${transform.k}) translate(${transform.x}, ${transform.y})`}
          >
            {/* Render tree edges first so they appear behind nodes */}
            {allEdges}
            {/* Render tree nodes and their labels on top */}
            {allNodes}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default NavigatorViewObject;