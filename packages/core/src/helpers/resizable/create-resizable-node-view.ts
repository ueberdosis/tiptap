import { createResizeHandle } from './create-resize-handles.js'
import { createDOMElement, createWrapper, defaultDirections } from './dom-utils.js'
import { setupResizeHandlers } from './setup-resize-handlers.js'
import type {
  ResizableNodeViewDiagonalDirection,
  ResizableNodeViewDirection,
  ResizableNodeViewOptions,
} from './types.js'

/**
 * Creates a resizable node view with size constraints
 */
export function createResizableNodeView({
  directions = defaultDirections,
  dom,
  editor,
  getPos,
  node,
  minWidth = 20,
  minHeight = 20,
}: ResizableNodeViewOptions): HTMLElement {
  // Setup the node DOM element
  dom.style.display = 'block'
  dom.style.position = 'relative'
  dom.style.zIndex = '0'

  // Create wrapper structure
  const wrapper = createWrapper()
  wrapper.appendChild(dom)

  // Add resize handles for each enabled direction (including corners)
  Object.entries(directions).forEach(([direction, isEnabled]) => {
    if (isEnabled) {
      const directionKey = direction as ResizableNodeViewDirection | ResizableNodeViewDiagonalDirection
      const handle = createResizeHandle(directionKey)
      wrapper.appendChild(handle)
      setupResizeHandlers(handle, directionKey, dom, editor, getPos, node, minWidth, minHeight)
    }
  })

  // Create the main container
  const container = createDOMElement('div', {
    classes: ['resize-container'],
    dataset: {
      resizeContainer: '',
      node: node.type.name,
    },
    styles: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
  })

  // Add the wrapper (which contains the original DOM) to the container
  container.appendChild(wrapper)

  return container
}
