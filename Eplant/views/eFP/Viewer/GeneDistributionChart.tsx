import * as React from 'react'
import { SVGProps, useEffect, useMemo, useState } from 'react'
import { EFPData } from '../types'
import { useDarkMode } from '@eplant/state'
import { useTheme } from '@mui/material'
import { Mail } from '@mui/icons-material'

const GeneDistributionChart = ({ data }: { data: EFPData }) => {
  const theme = useTheme()
  const [geneRanking, setGeneRanking] = useState<{
    [key: string]: string
  } | null>(null)
  const maxVal = data.max

  useEffect(() => {
    const fetchGeneRanking = async (value: number) => {
      const webservice = `//bar.utoronto.ca/eplant/cgi-bin/get_rank.php?expression=${value}`
      const response = await fetch(webservice).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response
      })

      const jsonResponse: { result: { [key: string]: string }[] } =
        await response.json()
      setGeneRanking(jsonResponse.result[0])
    }
    fetchGeneRanking(maxVal)
  }, [maxVal])

  const xVal = geneRanking
    ? 580 * (parseFloat(geneRanking.percentile) / 100) + 144
    : undefined

  const lineCoords = xVal ? 'M' + xVal + ' 587V220' : 'M400 587V220'
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
        width: '100%',
        height: '10%',
      }}
    >
      {geneRanking ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          xmlSpace='preserve'
          width={90}
          height={56}
          viewBox='0 0 960 600'
        >
          <path fill='none' stroke='red' strokeWidth={6} d={lineCoords} />
          <circle
            cx={xVal}
            cy={200}
            r={20}
            fill='red'
            stroke='red'
            strokeWidth={6}
          />
          <path
            fill='none'
            stroke={theme.palette.secondary.contrastText}
            strokeWidth={10}
            d='M144 587h580'
          />
          <path
            fill='none'
            stroke={theme.palette.secondary.contrastText}
            strokeWidth={6}
            d='M144 579c58 0 114-1 172-1 54 0 107-1 161-2 49-1 99-2 149-6 20-1 40-2 59-10 11-4 20-8 26-21 6-11 8-23 9-36 4-32 2-68 3-102V262'
          />
        </svg>
      ) : (
        <div></div>
      )}
      <div
        style={{
          fontSize: '12px',
          marginLeft: '11px',
        }}
      >
        {geneRanking
          ? `${Math.round(
              parseFloat(geneRanking.percentile)
            )}% expression level`
          : ''}
      </div>
    </div>
  )
}
export default GeneDistributionChart
