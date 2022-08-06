import { Box, BoxProps } from '@mui/material'
import React from 'react'

type Point = { x: number; y: number }

export default function PanZoom({ children, ...props }: BoxProps) {
  const [{ offset, zoom }, setOffset] = React.useState<{
    offset: Point
    zoom: number
  }>({
    offset: {
      x: 0,
      y: 0,
    },
    zoom: 1,
  })

  const [dragStart, setDragStart] =
    React.useState<{
      click: Point
      offset: Point
    } | null>(null)

  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const listener = (e: WheelEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (e.buttons == 0 && containerRef.current) {
        const { x, y, width, height } =
          containerRef.current.getBoundingClientRect()
        const { clientX, clientY } = e
        setOffset(({ offset, zoom }) => {
          // Adjust offset so that the mouse stays at the same position
          const newZoom = zoom * (1 - e.deltaY / 200)
          const mouseX = clientX - x - width / 2,
            mouseY = clientY - y - height / 2
          const updateX = mouseX / newZoom - mouseX / zoom,
            updateY = mouseY / newZoom - mouseY / zoom
          console.log({
            x: mouseX / zoom - offset.x,
            y: mouseY / zoom - offset.y,
            offset,
          })
          return {
            offset: {
              x: offset.x + updateX,
              y: offset.y + updateY,
            },
            zoom: newZoom,
          }
        })
      }
    }
    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', listener, {
        passive: false,
      })
      return () => {
        if (containerRef.current)
          containerRef.current.removeEventListener('wheel', listener)
      }
    }
  }, [containerRef.current, offset, zoom])

  return (
    <Box
      {...props}
      overflow="hidden"
      ref={containerRef}
      onMouseDown={(e) => {
        const { x, y } = e.currentTarget.getBoundingClientRect()
        const { clientX, clientY } = e
        setDragStart({
          click: { x: clientX - x, y: clientY - y },
          offset,
        })
      }}
      onMouseMove={(e) => {
        if (dragStart) {
          if (e.buttons == 0) {
            setDragStart(null)
            return
          }
          const { x, y } = e.currentTarget.getBoundingClientRect()
          const { clientX, clientY } = e
          const mouseX = clientX - x,
            mouseY = clientY - y
          setOffset({
            offset: {
              x: dragStart.offset.x + (mouseX - dragStart.click.x) / zoom,
              y: dragStart.offset.y + (mouseY - dragStart.click.y) / zoom,
            },
            zoom,
          })
        }
      }}
    >
      <Box
        sx={{
          userSelect: 'none',
          transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
