import { useState } from 'react'
import { useContext } from 'react'
import { Sidebar } from 'react-pro-sidebar'
import { Menu } from 'react-pro-sidebar'

import { collapseContext } from '@eplant/Eplant'
import { Container } from '@mui/material'
import { Box } from '@mui/material'

import SerializedGeneticElement from '../GeneticElement'
import { useActiveId, usePanes } from '../state'

import { LeftNav } from './LeftNav'
import ResponsiveDrawer from './ResponsiveDrawer'


// This sidebar width is hard coded --> not responsive to screen size
export const sidebarWidth = 300


export default function SideBar() {
  const [panes, panesDispatch] = usePanes()
  const [activeId] = useActiveId()


  const context = useContext(collapseContext)
  const collapse = context.collapse
  const setCollapse = context.setCollapse

  const [width, setWidth] = useState(sidebarWidth)
  const toggleCollapse = () => {
    setCollapse(!collapse)
  }

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
            width: `${collapse ? 0 : sidebarWidth}px`,
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
        <button onClick={() => toggleCollapse()}>Collapse</button>

      </ResponsiveDrawer>
    </div>
  )
}
