import { createDOMElement } from './dom-utils.js'
import type { ResizableNodeViewDiagonalDirection, ResizableNodeViewDirection } from './types.js'

/**
 * Creates a resize handle for the specified direction or diagonal direction
 */
export function createResizeHandle(
  direction: ResizableNodeViewDirection | ResizableNodeViewDiagonalDirection,
): HTMLElement {
  // Determine if this is a regular direction or a diagonal direction
  const isDiagonal = direction.includes('-')

  const styles: Record<string, string> = {
    position: 'absolute',
    zIndex: '1',
  }

  // Prepare classes array - all handles get 'resize-handle' class
  const classes = ['resize-handle']

  // Prepare dataset object
  const dataset: Record<string, string> = {
    resizeHandle: direction,
  }

  if (isDiagonal) {
    // Add diagonal-specific class
    classes.push('resize-handle-corner')

    // Handle diagonal directions (corners)
    styles.width = '12px'
    styles.height = '12px'

    // Add corner-specific class and dataset
    switch (direction) {
      case 'top-left':
        classes.push('resize-handle-top-left')
        dataset.corner = 'top-left'
        styles.top = '0'
        styles.left = '0'
        styles.cursor = 'nw-resize'
        break
      case 'top-right':
        classes.push('resize-handle-top-right')
        dataset.corner = 'top-right'
        styles.top = '0'
        styles.right = '0'
        styles.cursor = 'ne-resize'
        break
      case 'bottom-left':
        classes.push('resize-handle-bottom-left')
        dataset.corner = 'bottom-left'
        styles.bottom = '0'
        styles.left = '0'
        styles.cursor = 'sw-resize'
        break
      case 'bottom-right':
        classes.push('resize-handle-bottom-right')
        dataset.corner = 'bottom-right'
        styles.bottom = '0'
        styles.right = '0'
        styles.cursor = 'se-resize'
        break
      default:
        console.warn(`Unknown diagonal direction: ${direction}`)
        break
    }

    dataset.orientation = 'diagonal'
  } else {
    // Handle regular directions (edges)
    const isHorizontal = direction === 'left' || direction === 'right'

    // Add edge-specific class
    classes.push(isHorizontal ? 'resize-handle-horizontal' : 'resize-handle-vertical')
    classes.push(`resize-handle-${direction}`)

    styles.cursor = isHorizontal ? 'ew-resize' : 'ns-resize'

    if (isHorizontal) {
      styles.top = '0'
      styles.height = '100%'
    } else {
      styles.left = '0'
      styles.width = '100%'
    }

    // Position the handle on the correct side
    styles[direction] = '0'

    dataset.orientation = isHorizontal ? 'horizontal' : 'vertical'
    dataset.edge = direction
  }

  return createDOMElement('div', {
    classes,
    styles,
    attributes: {
      'aria-label': 'Resize',
    },
    dataset,
  })
}
