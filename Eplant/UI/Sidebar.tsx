import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import { Container } from '@mui/material'
import { Box } from '@mui/material'

import SerializedGeneticElement from '../GeneticElement'
import { useSidebarState } from '../state'

import { LeftNav } from './LeftNav'
import ResponsiveDrawer from './ResponsiveDrawer'

// This sidebar width is hard coded --> not responsive to screen size
export const sidebarWidth = 300
export const collapsedSidebarWidth = 100

export default function Sidebar() {
  const { viewId, geneId } = useParams()
  const navigate = useNavigate()

  const goToPage = (gene: SerializedGeneticElement) => {
    if (gene.id !== geneId) {
      console.log('go to page fired')
      navigate(`/${viewId}/${gene.id}` + window.location.search)
    }
  }
  const [isCollapse, setIsCollapse] = useSidebarState()
  return (
    <div>
      <ResponsiveDrawer
        variant='persistent'
        open={true}
        PaperProps={{
          sx: {
            border: 'none',
            backgroundColor: 'transparent',
          },
        }}
      >
        <Container
          disableGutters
          sx={{
            height: '100%',
            padding: '20px',
            width: `${isCollapse ? collapsedSidebarWidth : sidebarWidth}px`,
            boxSizing: 'border-box',
            transition: 'all 1s ease-out',
            overflow: 'hidden',
          }}
        >
          <LeftNav onSelectGene={goToPage} selectedGene={geneId} />
        </Container>
      </ResponsiveDrawer>
    </div>
  )
}
