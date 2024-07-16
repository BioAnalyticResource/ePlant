// -------
// IMPORTS
// -------
import React, { FC, useEffect, useLayoutEffect, useState } from 'react'

import { useCollections, useGeneticElements } from '@eplant/state'
import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup'
import ArrowLeft from '@mui/icons-material/ArrowLeft'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import useTheme from '@mui/material/styles/useTheme'
import Typography from '@mui/material/Typography'

import {
  CentromereItem,
  ChromosomeItem,
  GeneAnnotationItem,
  GeneItem,
} from '../types'

import GeneAnnotation from './GeneAnnotation'
import GeneList from './GeneList'

//----------
// TYPES
//----------
interface ChromosomeProps {
  scale: number
  chromosome: ChromosomeItem
}

interface Range {
  start: number
  end: number
}

//----------
// COMPONENT
//----------
const Chromosome: FC<ChromosomeProps> = ({ scale, chromosome }) => {
  // State
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [anchorOrigin, setAnchorOrigin] = useState<number[]>([])
  const [anchorEl, setAnchorEl] = useState<null | any>(null)
  const [geneRange, setGeneRange] = useState<Range>({
    start: 0,
    end: 0,
  })
  // Gene Annotation drawing
  const [geneAnnotationArray, setGeneAnnotationArray] = useState<
    GeneAnnotationItem[]
  >([])

  // Global State
  const [geneticElements] = useGeneticElements()
  const [collections] = useCollections()
  const theme = useTheme()

  // SVG drawing
  const centromeres: CentromereItem[] = chromosome.centromeres
  const hasCentromeres: boolean = centromeres.length > 0
  const lastCentromereEnd: number = hasCentromeres
    ? centromeres[centromeres.length - 1].end
    : 0

  const x: number = 10
  const y: number = 0
  const width: number = 10
  const perBpHeight: number = 0.000015
  let start: number = 0

  // Gene List popover variables
  const openPopup = Boolean(anchorEl)

  // Fire before paint, converts geneticElements into geneAnnotationArray
  useLayoutEffect(() => {
    const poplar = false
    const species = poplar ? 'Populus_trichocarpa' : 'Arabidopsis_thaliana'
    let newGeneAnnotationArray: GeneAnnotationItem[] = []
    geneticElements.map((gene) => {
      // for each item in geneticElements, fetch it's gene information to add to it's geneAnnotation
      fetch(
        `https://bar.utoronto.ca/eplant${
          poplar ? '_poplar' : ''
        }/cgi-bin/querygene.cgi?species=${species}&term=${gene.id}`
      )
        .then((response) => response.json())
        .then((geneItem) => {
          if (geneItem.chromosome === chromosome.id) {
            newGeneAnnotationArray = geneAnnotationArray
            const geneAnnotation: GeneAnnotationItem =
              getGeneAnnotation(geneItem)

            // Make sure new geneAnnotation is not already in geneAnnotationArray
            const isDuplicate = newGeneAnnotationArray.some((gene) => {
              if (gene.id === geneAnnotation.id) {
                return true
              }
              return false
            })
            if (!isDuplicate) {
              newGeneAnnotationArray.push(geneAnnotation)
              setGeneAnnotationArray(newGeneAnnotationArray)
            }
          }
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }, [])

  // Execute on first render, after paint
  useEffect(() => {
    const svg: HTMLElement & SVGSVGElement = getChromosomeSvg()
    // Get the bounds of the SVG content
    const bbox: SVGRect = svg.getBBox()
    // Update the width and height using the size of the contents
    svg.setAttribute('width', `${bbox.x + bbox.width + bbox.x}`)
    svg.setAttribute('height', `${bbox.y + bbox.height + bbox.y}`)
  }, [])

  //------------------
  // Helper Functions
  //------------------
  /**
   * formats a GeneItem into GeneAnnotationItem
   */
  const getGeneAnnotation = (gene: GeneItem): GeneAnnotationItem => {
    const genePixelLoc: number = ((gene.start + gene.end) / 2) * 0.000015
    const geneAnnotation: GeneAnnotationItem = {
      id: gene.id,
      chromosome: gene.chromosome,
      location: genePixelLoc,
      strand: gene.strand,
    }
    return geneAnnotation
  }
  /**
   * Gets the Chromosome svg element.
   */
  const getChromosomeSvg = (): HTMLElement & SVGSVGElement => {
    const svg = document.getElementById(chromosome.id + '_svg') as HTMLElement &
      SVGSVGElement
    return svg
  }
  /**
   * Gets the Chromosome top y-coordinate.
   */
  const getChromosomeYCoordinate = (): number => {
    return getChromosomeSvg().getBoundingClientRect().top
  }
  /**
   * Gets the Chromosome right x-coordinate.
   */
  const getChromosomeXCoordinate = (): number => {
    return getChromosomeSvg().getBoundingClientRect().right
  }
  /**
   * Gets the height of the Chromosome.
   */
  const getChromosomeHeight = (): number => {
    return getChromosomeSvg().getBoundingClientRect().height
  }
  /**
   * Gets the number of base-pairs per pixel.
   */
  const getBpPerPixel = (): number => {
    return chromosome.size / (getChromosomeHeight() - 1)
  }
  /**
   * Gets the number of pixels per base-pair.
   *
   * @return {Number} Number of pixels per base-pair.
   */
  const getPixelsPerBp = () => {
    return 1 / getBpPerPixel()
  }
  /**
   * Converts a pixel value to the equivalent base-pair range.
   *
   * @param {Number} pixel A screen y-coordinate.
   * @return {Number} Equivalent base-pair range.
   */
  const pixelToBp = (pixel: number): Range => {
    if (
      pixel > getChromosomeYCoordinate() &&
      pixel < getChromosomeYCoordinate() + getChromosomeHeight()
    ) {
      const range = {
        start: Math.floor(
          (pixel - 1 - getChromosomeYCoordinate()) * getBpPerPixel() + 1
        ),
        end: Math.floor((pixel - getChromosomeYCoordinate()) * getBpPerPixel()),
      }
      if (range.end > chromosome.size) {
        range.end = chromosome.size
      }
      return range
    } else {
      return {
        start: 0,
        end: 0,
      }
    }
  }

  //--------------
  // Event Handling
  //--------------
  // Handle click on chromosome
  const handleClick = (event: React.MouseEvent<SVGRectElement>) => {
    // define virtual element to attach geneList popup to
    const virtualEl = {
      getBoundingClientRect() {
        return {
          left: getChromosomeXCoordinate() + 100, // distanceX from the right of the chromosome (TODO: determine what side of the screen click is on and accordingly place popup on left or right of chromosome)
          top: event.clientY - 60, // distanceY from click(has weird functionality- need to fix)
          width: 0,
          height: 0,
        }
      },
    }
    setAnchorEl(anchorEl ? null : virtualEl)
    setAnchorOrigin([event.clientX, event.clientY])
    setGeneRange(pixelToBp(event.clientY))
  }
  // Handle popup close
  const handleClose = () => {
    setAnchorOrigin([])
    setAnchorEl(null)
  }
  const handleMouseOverChromosome = () => {
    setIsHovered(true)
  }
  const handleMouseLeaveChromosome = () => {
    setIsHovered(false)
  }

  return (
    <>
      {/* GENE LIST POPUP */}
      <Popup
        open={openPopup}
        anchor={anchorEl}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <ArrowLeft
          fontSize='medium'
          htmlColor={theme.palette.primary.main}
          sx={{
            position: 'relative',
          }}
        />
        <div>
          <Typography variant='caption' sx={{ fontSize: 9 }}>
            {geneRange.start.toLocaleString()}
          </Typography>

          <ClickAwayListener onClickAway={handleClose}>
            <Box
              sx={{
                background: theme.palette.background.paper,
                border: `1.5px solid ${theme.palette.primary.dark}`,
                p: 0,
                width: '180px',
                maxHeight: '100px',
                minHeight: 30,
                overflowY: 'scroll',
                overflowX: 'clip',
              }}
            >
              <GeneList
                id={chromosome.id}
                start={geneRange.start}
                end={geneRange.end}
                anchorOrigin={anchorOrigin}
              />
            </Box>
          </ClickAwayListener>
          <Typography variant='caption' sx={{ fontSize: 9 }}>
            {geneRange.end.toLocaleString()}
          </Typography>
        </div>
      </Popup>
      {/* =============== */}
      {/* CHROMOSOME SVG */}
      <svg
        id={chromosome.id + '_svg'}
        width='0'
        height={chromosome.size * perBpHeight}
        viewBox='0 0 width height'
        preserveAspectRatio='xMidYMid meet'
        overflow='visible'
      >
        <g>
          {/*Centromeric Layer  */}
          {hasCentromeres ? (
            <rect
              x={x}
              y={y}
              width={width * 0.6}
              height={chromosome.size * perBpHeight}
              ry={width / 2}
              fill='gray'
            />
          ) : (
            <rect
              x={x}
              y={y}
              width={width}
              height={chromosome.size * perBpHeight}
              ry={chromosome.size * perBpHeight > 10 ? width / 2 : '50%'}
              fill='gray'
            />
          )}
          {/* Non-Centromeric Layers */}
          {/* note: all except last can be drawn in a loop */}
          {hasCentromeres &&
            centromeres.map((centromere, index) => {
              start = index === 0 ? 0 : centromeres[index - 1].end
              const end = centromere.start
              return (
                <rect
                  x={x - 2}
                  y={y + start * perBpHeight}
                  width={width}
                  height={(end - start) * perBpHeight}
                  ry={
                    (end - start) * perBpHeight < 4
                      ? 2
                      : (end - start) * perBpHeight < 10
                        ? 3
                        : width / 2
                  }
                  fill='gray'
                  key={index}
                />
              )
            })}
          {/* Last Non-Centromeric Layer must be drawn seperately*/}
          {hasCentromeres && (
            <rect
              x={x - 2}
              y={y + lastCentromereEnd * perBpHeight}
              width={width}
              height={(chromosome.size - lastCentromereEnd) * perBpHeight}
              rx={width / 2}
              ry={width / 2}
              fill='gray'
            />
          )}
          {/* Input Layer (transparent, must be drawn on top of other layers)*/}
          <rect
            id={chromosome.id + '_input'}
            x={x - 2}
            y={y}
            width={width}
            height={chromosome.size * perBpHeight}
            rx={width / 2}
            ry={width / 2}
            fill='transparent'
            onMouseEnter={handleMouseOverChromosome}
            onMouseLeave={handleMouseLeaveChromosome}
            cursor={isHovered ? 'pointer' : 'default'}
            onClick={handleClick}
          />
        </g>
        {/* GENES ANNOTATION TAGS */}
        <g id={`${chromosome.id}_geneAnnotationTags`}>
          {geneAnnotationArray.map((gene, i) => {
            // Flatten collections into array of gene IDs - important for not drawing removed gene annotations
            const flatGeneCollection = collections.flatMap(
              (collection) => collection.genes
            )
            // Make sure that the gene actually is in a collection
            // fixes bug where the gene annotations for removed genes dont disappear
            if (flatGeneCollection.includes(gene.id)) {
              return <GeneAnnotation key={i} gene={gene} scale={scale} />
            }
          })}
        </g>
      </svg>
    </>
  )
}

export default Chromosome
