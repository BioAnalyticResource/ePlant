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
  GeneRange,
} from '../types'

import GeneAnnotation from './GeneAnnotation'
import GeneList from './GeneList'
import {
  getChromosomeSvg,
  getChromosomeXCoordinate,
  getGeneAnnotation,
  pixelToBp,
} from './utilities'

//----------
// TYPES
//----------
interface ChromosomeProps {
  scale: number
  chromosome: ChromosomeItem
}

//----------
// COMPONENT
//----------
const Chromosome: FC<ChromosomeProps> = ({ scale, chromosome }) => {
  // State
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [anchorOrigin, setAnchorOrigin] = useState<number[]>([])
  const [anchorEl, setAnchorEl] = useState<null | any>(null)
  const [geneRange, setGeneRange] = useState<GeneRange>({
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
    // TODO: move this to top level to prevent uneccessary api calls
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
    const svg: HTMLElement & SVGSVGElement = getChromosomeSvg(chromosome.id)
    // Get the bounds of the SVG content
    const bbox: SVGRect = svg.getBBox()
    // Update the width and height using the size of the contents
    svg.setAttribute('width', `${bbox.x + bbox.width + bbox.x}`)
    svg.setAttribute('height', `${bbox.y + bbox.height + bbox.y}`)
  }, [])

  //--------------
  // Event Handling
  //--------------
  // Handle click on chromosome
  const handleClick = (event: React.MouseEvent<SVGRectElement>) => {
    // define virtual element to attach geneList popup to
    const virtualEl = {
      getBoundingClientRect() {
        return {
          left: getChromosomeXCoordinate(chromosome.id) + 100, // distanceX from the right of the chromosome (TODO: determine what side of the screen click is on and accordingly place popup on left or right of chromosome)
          top: event.clientY - 60, // distanceY from click(has weird functionality- need to fix)
          width: 0,
          height: 0,
        }
      },
    }
    setAnchorEl(anchorEl ? null : virtualEl)
    setAnchorOrigin([event.clientX, event.clientY])
    setGeneRange(pixelToBp(geneRange, chromosome, event.clientY))
  }
  const handleMouseOverChromosome = () => {
    setIsHovered(true)
  }
  const handleMouseLeaveChromosome = () => {
    setIsHovered(false)
  }
  // Handle popup close
  const handleClose = () => {
    setAnchorOrigin([])
    setAnchorEl(null)
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
          {/* CENTROMERIC LAYER */}
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
          {/* NON-CENTROMERIC LAYERS */}
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
          {/* LAST NON-CENTROMERIC LAYER > must be drawn seperately */}
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
          {/* INPUT LAYER (transparent, must be drawn on top of other layers) */}
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
