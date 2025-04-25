import type { Node } from 'packages/pm/model'

import type { Editor } from '../../Editor.js'
import type { ResizableNodeViewDiagonalDirection, ResizableNodeViewDirection } from './types.js'

// Default minimum dimensions (pixels)
const DEFAULT_MIN_WIDTH = 20
const DEFAULT_MIN_HEIGHT = 20

/**
 * Sets up resize event handlers for a handle with size clamping
 */
export function setupResizeHandlers(
  element: HTMLElement,
  direction: ResizableNodeViewDirection | ResizableNodeViewDiagonalDirection,
  dom: HTMLElement,
  editor: Editor,
  getPos: () => number | undefined,
  node: Node,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
): void {
  let isResizing = false
  let currentPosition: { x: number; y: number } | null = null

  // Determine which dimensions to update based on direction
  const updateWidth =
    direction === 'left' ||
    direction === 'right' ||
    direction === 'top-left' ||
    direction === 'top-right' ||
    direction === 'bottom-left' ||
    direction === 'bottom-right'

  const updateHeight =
    direction === 'top' ||
    direction === 'bottom' ||
    direction === 'top-left' ||
    direction === 'top-right' ||
    direction === 'bottom-left' ||
    direction === 'bottom-right'

  // Determine which side of the element we're affecting
  const affectsLeft = direction === 'left' || direction === 'top-left' || direction === 'bottom-left'
  const affectsTop = direction === 'top' || direction === 'top-left' || direction === 'top-right'

  const handleMove = (e: MouseEvent | TouchEvent): void => {
    if (!isResizing || !currentPosition) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const newPosition = {
      x: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
      y: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY,
    }

    const deltaX = newPosition.x - currentPosition.x
    const deltaY = newPosition.y - currentPosition.y

    // Calculate new dimensions based on direction and delta
    let newWidth = updateWidth ? dom.clientWidth + (affectsLeft ? -deltaX : deltaX) : dom.clientWidth

    let newHeight = updateHeight ? dom.clientHeight + (affectsTop ? -deltaY : deltaY) : dom.clientHeight

    // Apply size clamping
    newWidth = Math.max(minWidth, newWidth)
    newHeight = Math.max(minHeight, newHeight)

    // Only update width if it's being modified and is above minimum size
    if (updateWidth) {
      dom.style.width = `${newWidth}px`
    }

    // Only update height if it's being modified and is above minimum size
    if (updateHeight) {
      dom.style.height = `${newHeight}px`
    }

    currentPosition = newPosition
  }

  const handleEnd = (e: MouseEvent | TouchEvent): void => {
    if (!isResizing) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    isResizing = false
    currentPosition = null

    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchend', handleEnd)

    const pos = getPos()
    if (pos === undefined) {
      return
    }

    editor.commands.command(({ tr }) => {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        width: updateWidth ? dom.clientWidth : node.attrs.width,
        height: updateHeight ? dom.clientHeight : node.attrs.height,
      })

      return true
    })
  }

  const handleStart = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault()
    e.stopPropagation()

    isResizing = true
    currentPosition = {
      x: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
      y: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY,
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)
  }

  element.addEventListener('mousedown', handleStart)
  element.addEventListener('touchstart', handleStart)
}
