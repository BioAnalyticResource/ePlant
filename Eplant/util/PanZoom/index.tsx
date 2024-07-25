import { useEffect, useRef, useState } from 'react'

import { Box, BoxProps } from '@mui/material'

type Point = { x: number; y: number }
export type Transform = {
  offset: Point
  zoom: number
}

export default function PanZoom({
  children,
  onTransformChange,
  transform,
  ...props
}: BoxProps & {
  transform: Transform
  onTransformChange: (transform: Transform) => void
}) {
  const [dragStart, setDragStart] = useState<{
    click: Point
    offset: Point
  } | null>(null)

  const { offset, zoom } = transform
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const listener = (e: WheelEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (e.buttons == 0 && containerRef.current) {
        const { x, y, width, height } =
          containerRef.current.getBoundingClientRect()
        const { clientX, clientY } = e
        // Adjust offset so that the mouse stays at the same position
        const newZoom = zoom * (1 - e.deltaY / 200)
        if (newZoom < 0.25 || newZoom > 4) return { offset, zoom }
        const mouseX = clientX - x - width / 2,
          mouseY = clientY - y - height / 2
        const updateX = mouseX / newZoom - mouseX / zoom,
          updateY = mouseY / newZoom - mouseY / zoom
        const newTransform = {
          offset: {
            x: offset.x + updateX,
            y: offset.y + updateY,
          },
          zoom: newZoom,
        }
        onTransformChange(newTransform)
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
      overflow='hidden'
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
          onTransformChange({
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
