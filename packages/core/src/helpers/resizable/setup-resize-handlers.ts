import type { Node } from '@tiptap/pm/model'

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
  preserveAspectRatio = false,
): void {
  let isResizing = false
  let currentPosition: { x: number; y: number } | null = null

  let initialDimensions = {
    width: dom.clientWidth,
    height: dom.clientHeight,
  }

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

  function updateNodeSize() {
    const pos = getPos()
    if (pos === undefined) {
      return
    }

    const hasUpdatedWidth = dom.clientWidth !== initialDimensions.width
    const hasUpdatedHeight = dom.clientHeight !== initialDimensions.height

    editor.commands.command(({ tr }) => {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        width: hasUpdatedWidth ? dom.clientWidth : node.attrs.width,
        height: hasUpdatedHeight ? dom.clientHeight : node.attrs.height,
      })

      return true
    })
  }

  const handleMove = (e: MouseEvent | TouchEvent): void => {
    if (!isResizing || !currentPosition) {
      return
    }

    const isAspectLocked = e.shiftKey || preserveAspectRatio

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

    // If aspect ratio is locked, adjust the other dimension accordingly
    if (isAspectLocked) {
      const aspectRatio = initialDimensions.width / initialDimensions.height
      if (updateWidth) {
        newHeight = Math.round(newWidth / aspectRatio)
      } else if (updateHeight) {
        newWidth = Math.round(newHeight * aspectRatio)
      }
    }

    const hasUpdatedWidth = newWidth !== dom.clientWidth
    const hasUpdatedHeight = newHeight !== dom.clientHeight

    // Only update width if it's being modified and is above minimum size
    if (hasUpdatedWidth) {
      dom.style.width = `${newWidth}px`
    }

    // Only update height if it's being modified and is above minimum size
    if (hasUpdatedHeight) {
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

    updateNodeSize()

    isResizing = false
    currentPosition = null

    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchend', handleEnd)
  }

  const handleKeydown = (e: KeyboardEvent): void => {
    // if we press escape, we stop resizing and stop all event handlers
    // and also reset the initial dimensions
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()

      isResizing = false
      currentPosition = null

      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('keydown', handleKeydown)

      dom.style.width = `${initialDimensions.width}px`
      dom.style.height = `${initialDimensions.height}px`

      updateNodeSize()

      initialDimensions = {
        width: dom.clientWidth,
        height: dom.clientHeight,
      }

      document.removeEventListener('keydown', handleKeydown)
    }
  }

  const handleStart = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault()
    e.stopPropagation()

    initialDimensions = {
      width: dom.clientWidth,
      height: dom.clientHeight,
    }

    isResizing = true
    currentPosition = {
      x: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
      y: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY,
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('keydown', handleKeydown)
  }

  element.addEventListener('mousedown', handleStart)
  element.addEventListener('touchstart', handleStart)
}
