import { useNavigate, useParams } from 'react-router-dom'

import { Container } from '@mui/material'

import SerializedGeneticElement from '../GeneticElement'

import { LeftNav } from './LeftNav'
import ResponsiveDrawer from './ResponsiveDrawer'

export const sidebarWidth = 300

export default function Sidebar() {
  const {viewId, geneId} = useParams()
  const navigate = useNavigate();

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
            navigate(`/${viewId}/${gene.id}` + window.location.search)
          }
          selectedGene={geneId}
        />
      </Container>
    </ResponsiveDrawer>
  )
}
