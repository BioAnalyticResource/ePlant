import { Container } from '@mui/material'

import SerializedGeneticElement from '../GeneticElement'
import { useActiveGeneId } from '../state'

import { LeftNav } from './LeftNav'
import ResponsiveDrawer from './ResponsiveDrawer'

export const sidebarWidth = 300

export default function Sidebar() {
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  return (
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
          width: `${sidebarWidth}px`,
          boxSizing: 'border-box',
        }}
      >
        <LeftNav
          onSelectGene={(gene: SerializedGeneticElement) =>
            setActiveGeneId(gene.id)
          }
          selectedGene={activeGeneId}        />
      </Container>
    </ResponsiveDrawer>
  )
}
