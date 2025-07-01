import { useRef } from 'react'
import * as d3 from 'd3'

import { D3Node } from '../types'

import * as constants from './constants'

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
export const MetadataVisualizations = ({
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
