import { CSSProperties } from 'react'
import _ from 'lodash'

import GeneticElement from '@eplant/GeneticElement'
import { useTheme } from '@mui/material'

import { CodeBody } from './CodeBody'
import { GeneInfoViewData } from './types'

export const GeneSequence = ({
  activeData,
  geneticElement,
}: {
  activeData: GeneInfoViewData
  geneticElement: GeneticElement | null
}) => {
  const theme = useTheme()
  const spans = []
  const feature = activeData.features.find(
    (sf) => sf.uniqueID == geneticElement?.id + '.1'
  )
  // Can't render anything if there is no feature
  if (!feature) return <></>
  for (
    let i = 0, prevStyle = {}, str = '';
    i < activeData.geneSequence.length;
    i++
  ) {
    let char = (activeData.geneSequence[i] as string).toUpperCase()
    let currentStyle: CSSProperties = {}

    // Add regions around the three prime utr and five prime utr
    const features: {
      type: string
      start: number
      end: number
      [key: string]: any
    }[] = [...feature.subfeatures]

    features
      .filter(
        (sf: any) => sf.type == 'five_prime_UTR' || sf.type == 'three_prime_UTR'
      )
      .map((a: any) => {
        if (
          (a.type == 'three_prime_UTR' && a.strand == '1') ||
          (a.type == 'five_prime_UTR' && a.strand != '1')
        )
          features.push({
            type: 'end-cap',
            start: a.start - 3,
            end: a.start - 1,
          })
        else
          features.push({
            type: 'end-cap',
            start: a.end + 1,
            end: a.end + 3,
          })
      })

    // Add styles for each feature that includes this char
    const pos = i + activeData.chromosome_start
    let found = false
    for (const sf of features) {
      if (sf.start <= pos && pos <= sf.end) {
        if (sf.type.endsWith('UTR')) {
          char = char.toLowerCase()
          currentStyle = { color: theme.palette.error.main }
          found = true
        }
        if (sf.type == 'exon') {
          currentStyle = { color: theme.palette.warning.main }
          found = true
        }
        if (sf.type == 'end-cap') {
          currentStyle = {
            backgroundColor: theme.palette.info.main,
            color: theme.palette.info.contrastText,
          }
          found = true
        }
      }
    }
    if (!found) {
      char = char.toLowerCase()
      currentStyle = {
        color: theme.palette.info.main,
      }
    }

    // Push a new span whenever the styles change and at the end of the loop
    if (
      !_.isEqual(prevStyle, currentStyle) ||
      i == activeData.geneSequence.length - 1
    ) {
      spans.push(
        <span style={prevStyle} key={spans.length}>
          {str}
        </span>
      )
      str = ''
    }
    str += char
    prevStyle = currentStyle
  }
  return (
    <>
      <CodeBody variant='caption'>{spans}</CodeBody>
    </>
  )
}
