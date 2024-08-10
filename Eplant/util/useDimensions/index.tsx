import { MutableRefObject, useEffect, useState } from 'react'

/**
 * A hook that returns the dimensions of a DOM node.
 * @param ref The ref of the DOM node.
 */
export default function useDimensions(
  ref: MutableRefObject<HTMLElement | null>
) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (ref && ref.current) {
      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect
        setDimensions({ width, height })
      })
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [ref])
  return dimensions
}
