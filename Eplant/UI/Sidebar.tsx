import { Container } from '@mui/material'

import SerializedGeneticElement from '../GeneticElement'
import { useSidebarState } from '../state'
import { useActiveGeneId } from '../state'

import { LeftNav } from './LeftNav'
import ResponsiveDrawer from './ResponsiveDrawer'

// This sidebar width is hard coded --> not responsive to screen size
export const sidebarWidth = 300
export const collapsedSidebarWidth = 100

export default function Sidebar() {
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [isCollapse] = useSidebarState()
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
          <LeftNav
            onSelectGene={(gene: SerializedGeneticElement) =>
              setActiveGeneId(gene.id)
            }
            selectedGene={activeGeneId}
          />
        </Container>
      </ResponsiveDrawer>
    </div>
  )
}
