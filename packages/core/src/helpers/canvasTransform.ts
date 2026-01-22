/**
 * Canvas Coordinate Transformation Helpers
 *
 * Utilities for transforming coordinates between different coordinate spaces
 * in canvas-aware editors.
 */

import type { CanvasContext, Point, Viewport } from '../types/canvas.js'

/**
 * Create coordinate transformation functions for a canvas context
 */
export function createCoordinateTransform(
  viewport: Viewport,
  nodePosition: Point,
  editorElement?: HTMLElement | null,
): {
  screenToCanvas: (screenPoint: Point) => Point
  canvasToScreen: (canvasPoint: Point) => Point
  screenToEditor: (screenPoint: Point) => Point
  editorToScreen: (editorPoint: Point) => Point
} {
  const { offset, zoom } = viewport

  return {
    /**
     * Transform screen coordinates to canvas coordinates
     */
    screenToCanvas: (screenPoint: Point): Point => ({
      x: (screenPoint.x - offset.x) / zoom,
      y: (screenPoint.y - offset.y) / zoom,
    }),

    /**
     * Transform canvas coordinates to screen coordinates
     */
    canvasToScreen: (canvasPoint: Point): Point => ({
      x: canvasPoint.x * zoom + offset.x,
      y: canvasPoint.y * zoom + offset.y,
    }),

    /**
     * Transform screen coordinates to editor-local coordinates
     */
    screenToEditor: (screenPoint: Point): Point => {
      if (!editorElement) {
        console.warn('Cannot transform screen to editor coordinates: no editor element')
        return screenPoint
      }

      const editorRect = editorElement.getBoundingClientRect()
      return {
        x: screenPoint.x - editorRect.left,
        y: screenPoint.y - editorRect.top,
      }
    },

    /**
     * Transform editor-local coordinates to screen coordinates
     */
    editorToScreen: (editorPoint: Point): Point => {
      if (!editorElement) {
        console.warn('Cannot transform editor to screen coordinates: no editor element')
        return editorPoint
      }

      const editorRect = editorElement.getBoundingClientRect()
      return {
        x: editorPoint.x + editorRect.left,
        y: editorPoint.y + editorRect.top,
      }
    },
  }
}

/**
 * Check if a point is within a rectangle
 */
export function isPointInRect(point: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}

/**
 * Check if a rectangle intersects with the viewport
 */
export function isRectInViewport(
  rect: { x: number; y: number; width: number; height: number },
  viewport: Viewport,
): boolean {
  const viewportRight = viewport.offset.x + viewport.size.width / viewport.zoom
  const viewportBottom = viewport.offset.y + viewport.size.height / viewport.zoom
  const rectRight = rect.x + rect.width
  const rectBottom = rect.y + rect.height

  return (
    rect.x < viewportRight && rectRight > viewport.offset.x && rect.y < viewportBottom && rectBottom > viewport.offset.y
  )
}

/**
 * Calculate the visible portion of a rectangle in the viewport
 * Returns the intersection of the rectangle and viewport in canvas coordinates
 */
export function getVisibleRect(
  rect: { x: number; y: number; width: number; height: number },
  viewport: Viewport,
): { x: number; y: number; width: number; height: number } | null {
  if (!isRectInViewport(rect, viewport)) {
    return null
  }

  const viewportRight = viewport.offset.x + viewport.size.width / viewport.zoom
  const viewportBottom = viewport.offset.y + viewport.size.height / viewport.zoom
  const rectRight = rect.x + rect.width
  const rectBottom = rect.y + rect.height

  const x = Math.max(rect.x, viewport.offset.x)
  const y = Math.max(rect.y, viewport.offset.y)
  const right = Math.min(rectRight, viewportRight)
  const bottom = Math.min(rectBottom, viewportBottom)

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  }
}

/**
 * Calculate the distance between two points
 */
export function distanceBetweenPoints(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Lerp (linear interpolation) between two points
 */
export function lerpPoints(p1: Point, p2: Point, t: number): Point {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  }
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Clamp a point within a rectangle
 */
export function clampPointToRect(point: Point, rect: { x: number; y: number; width: number; height: number }): Point {
  return {
    x: clamp(point.x, rect.x, rect.x + rect.width),
    y: clamp(point.y, rect.y, rect.y + rect.height),
  }
}

/**
 * Create a default canvas context for testing or fallback
 */
export function createDefaultCanvasContext(
  editorElement?: HTMLElement | null,
  nodeId: string = 'default-node',
): CanvasContext {
  const viewport: Viewport = {
    offset: { x: 0, y: 0 },
    size: { width: window.innerWidth, height: window.innerHeight },
    zoom: 1.0,
  }

  const node = {
    id: nodeId,
    position: { x: 0, y: 0 },
    size: { width: 400, height: 300 },
  }

  return {
    viewport,
    node,
    mode: 'edit' as any,
    transform: createCoordinateTransform(viewport, node.position, editorElement),
    isVisible: true,
    updateViewport: () => {},
    updateNode: () => {},
    updateMode: () => {},
  }
}
