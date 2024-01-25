import { Container } from '@mui/material'
import SerializedGeneticElement from '../GeneticElement'
import { useActiveId, usePanes } from '../state'
import { LeftNav } from './LeftNav'
import ResponsiveDrawer from './ResponsiveDrawer'

export const sidebarWidth = 300

export default function Sidebar() {
  const [panes, panesDispatch] = usePanes()
  const [activeId] = useActiveId()

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
            panesDispatch({
              type: 'set-active-gene',
              id: activeId,
              activeGene: gene.id,
            })
          }
          selectedGene={panes[activeId ?? '']?.activeGene ?? undefined}
        />
      </Container>
    </ResponsiveDrawer>
  )
}
