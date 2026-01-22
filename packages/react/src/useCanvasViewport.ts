import type { Point, Viewport } from '@dibdab/core'
import { useCallback, useEffect,useRef, useState } from 'react'

export interface UseCanvasViewportOptions {
  /**
   * Initial viewport
   */
  initialViewport?: Viewport

  /**
   * Minimum zoom level
   * @default 0.1
   */
  minZoom?: number

  /**
   * Maximum zoom level
   * @default 5
   */
  maxZoom?: number

  /**
   * Zoom step for zoom in/out
   * @default 0.1
   */
  zoomStep?: number

  /**
   * Whether to debounce viewport updates
   * @default true
   */
  debounce?: boolean

  /**
   * Debounce delay in milliseconds
   * @default 100
   */
  debounceDelay?: number

  /**
   * Callback when viewport changes
   */
  onChange?: (viewport: Viewport) => void
}

export function useCanvasViewport(options: UseCanvasViewportOptions = {}) {
  const {
    initialViewport = {
      offset: { x: 0, y: 0 },
      size: { width: window.innerWidth, height: window.innerHeight },
      zoom: 1,
    },
    minZoom = 0.1,
    maxZoom = 5,
    zoomStep = 0.1,
    debounce = true,
    debounceDelay = 100,
    onChange,
  } = options

  const [viewport, setViewport] = useState<Viewport>(initialViewport)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Update viewport with optional debouncing
  const updateViewport = useCallback(
    (updates: Partial<Viewport>) => {
      setViewport(prev => {
        const newViewport = {
          ...prev,
          ...updates,
          offset: updates.offset ? { ...prev.offset, ...updates.offset } : prev.offset,
          size: updates.size ? { ...prev.size, ...updates.size } : prev.size,
        }

        // Clamp zoom
        if (updates.zoom !== undefined) {
          newViewport.zoom = Math.max(minZoom, Math.min(maxZoom, updates.zoom))
        }

        if (onChange) {
          if (debounce) {
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current)
            }
            debounceTimeoutRef.current = setTimeout(() => {
              onChange(newViewport)
              debounceTimeoutRef.current = null
            }, debounceDelay)
          } else {
            onChange(newViewport)
          }
        }

        return newViewport
      })
    },
    [onChange, debounce, debounceDelay, minZoom, maxZoom],
  )

  // Pan the viewport by a delta
  const pan = useCallback(
    (delta: Point) => {
      updateViewport({
        offset: {
          x: viewport.offset.x + delta.x,
          y: viewport.offset.y + delta.y,
        },
      })
    },
    [viewport.offset, updateViewport],
  )

  // Zoom in
  const zoomIn = useCallback(
    (_anchor?: Point) => {
      const newZoom = Math.min(maxZoom, viewport.zoom + zoomStep)
      updateViewport({ zoom: newZoom })
    },
    [viewport.zoom, maxZoom, zoomStep, updateViewport],
  )

  // Zoom out
  const zoomOut = useCallback(
    (_anchor?: Point) => {
      const newZoom = Math.max(minZoom, viewport.zoom - zoomStep)
      updateViewport({ zoom: newZoom })
    },
    [viewport.zoom, minZoom, zoomStep, updateViewport],
  )

  // Set zoom level
  const setZoom = useCallback(
    (zoom: number, _anchor?: Point) => {
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom))
      updateViewport({ zoom: clampedZoom })
    },
    [minZoom, maxZoom, updateViewport],
  )

  // Center viewport on a point
  const centerOn = useCallback(
    (point: Point) => {
      updateViewport({
        offset: {
          x: point.x - viewport.size.width / 2 / viewport.zoom,
          y: point.y - viewport.size.height / 2 / viewport.zoom,
        },
      })
    },
    [viewport.size, viewport.zoom, updateViewport],
  )

  // Fit rectangle in viewport
  const fitRect = useCallback(
    (rect: { x: number; y: number; width: number; height: number }, padding = 20) => {
      const scaleX = (viewport.size.width - padding * 2) / rect.width
      const scaleY = (viewport.size.height - padding * 2) / rect.height
      const newZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(scaleX, scaleY)))

      updateViewport({
        zoom: newZoom,
        offset: {
          x: rect.x - padding / newZoom,
          y: rect.y - padding / newZoom,
        },
      })
    },
    [viewport.size, minZoom, maxZoom, updateViewport],
  )

  // Reset to initial viewport
  const reset = useCallback(() => {
    setViewport(initialViewport)
    if (onChange) {
      onChange(initialViewport)
    }
  }, [initialViewport, onChange])

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    viewport,
    updateViewport,
    pan,
    zoomIn,
    zoomOut,
    setZoom,
    centerOn,
    fitRect,
    reset,
  }
}
