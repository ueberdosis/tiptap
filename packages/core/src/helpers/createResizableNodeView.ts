import type { Node } from 'packages/pm/model'

import type { Editor } from '../Editor'

export type ResizableNodeViewDirection = 'top' | 'right' | 'bottom' | 'left'
export type ResizableNodeViewDiagonalDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type ResizableNodeViewDirections = {
  [key in ResizableNodeViewDirection]: boolean
}

export interface ResizableNodeViewOptions {
  directions?: ResizableNodeViewDirections
  dom: HTMLElement
  editor: Editor
  getPos: () => number | undefined
  node: Node
}

const defaultDirections: ResizableNodeViewDirections = {
  bottom: true,
  left: true,
  right: true,
  top: true,
}

function createWrapper(nodeName: string) {
  const wrapper = document.createElement('div')

  wrapper.style.position = 'relative'
  wrapper.style.display = 'inline-block'
  wrapper.dataset.node = nodeName

  return wrapper
}

function createResizeHandle(direction: ResizableNodeViewDirection) {
  const handle = document.createElement('div')
  const isHorizontal = direction === 'left' || direction === 'right'

  handle.ariaLabel = 'Resize'
  handle.style.position = 'absolute'
  handle.style.zIndex = '1'

  handle.classList.add('resize-handle')
  handle.dataset.resizeHandle = direction
  handle.dataset.orientation = isHorizontal ? 'horizontal' : 'vertical'

  if (isHorizontal) {
    handle.style.top = '0'
    handle.style.height = '100%'
    handle.style.cursor = 'ew-resize'
  } else {
    handle.style.left = '0'
    handle.style.width = '100%'
    handle.style.cursor = 'ns-resize'
  }

  if (direction === 'left') {
    handle.style.left = '0'
  }

  if (direction === 'right') {
    handle.style.right = '0'
  }

  if (direction === 'top') {
    handle.style.top = '0'
  }

  if (direction === 'bottom') {
    handle.style.bottom = '0'
  }

  return handle
}

/* function getDiagonalDirectionFromDirections(directions: ResizableNodeViewDirections) {
  let direction: ResizableNodeViewDiagonalDirection | null = null

  if (directions.top && directions.left) {
    direction = 'top-left'
  }
  if (directions.top && directions.right) {
    direction = 'top-right'
  }
  if (directions.bottom && directions.left) {
    direction = 'bottom-left'
  }
  if (directions.bottom && directions.right) {
    direction = 'bottom-right'
  }

  return direction
}

function createResizeCorner(direction: ResizableNodeViewDiagonalDirection) {
  const corner = document.createElement('div')

  corner.ariaLabel = 'Resize'
  corner.style.position = 'absolute'
  corner.style.zIndex = '2'

  corner.classList.add('resize-corner')
  corner.dataset['resize-corner'] = ''

  if (direction === 'top-left' || direction === 'top-right') {
    corner.style.top = '0'
  } else if (direction === 'bottom-left' || direction === 'bottom-right') {
    corner.style.bottom = '0'
  }

  if (direction === 'top-left' || direction === 'bottom-left') {
    corner.style.left = '0'
  } else if (direction === 'top-right' || direction === 'bottom-right') {
    corner.style.right = '0'
  }

  if (direction === 'top-left') {
    corner.style.cursor = 'nw-resize'
  }

  if (direction === 'top-right') {
    corner.style.cursor = 'ne-resize'
  }

  if (direction === 'bottom-left') {
    corner.style.cursor = 'sw-resize'
  }

  if (direction === 'bottom-right') {
    corner.style.cursor = 'se-resize'
  }

  return corner
} */

export function createResizableNodeView({
  directions = defaultDirections,
  dom,
  editor,
  getPos,
  node,
}: ResizableNodeViewOptions) {
  const wrapper = createWrapper(node.type.name)

  function bindResizeToHandle(element: HTMLElement, direction: ResizableNodeViewDirection) {
    let isResizing = false
    let currentPosition: { x: number; y: number } | null = null

    const updateWidth = direction === 'left' || direction === 'right'
    const updateHeight = direction === 'top' || direction === 'bottom'

    function onMove(e: MouseEvent | TouchEvent) {
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

      const newWidth = updateWidth ? dom.clientWidth + (direction === 'left' ? -deltaX : deltaX) : dom.clientWidth
      const newHeight = updateHeight ? dom.clientHeight + (direction === 'top' ? -deltaY : deltaY) : dom.clientHeight

      if (newWidth > 0 && updateWidth) {
        dom.style.width = `${newWidth}px`
      }

      if (newHeight > 0 && updateHeight) {
        dom.style.height = `${newHeight}px`
      }

      currentPosition = newPosition
    }

    function onEnd(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      e.stopPropagation()

      isResizing = false
      currentPosition = null

      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchend', onEnd)

      const pos = getPos()
      if (!pos) {
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

    function onStart(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      e.stopPropagation()

      isResizing = true
      currentPosition = {
        x: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
        y: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY,
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('touchmove', onMove)
      document.addEventListener('mouseup', onEnd)
      document.addEventListener('touchend', onEnd)
    }

    element.addEventListener('mousedown', onStart)
    element.addEventListener('touchstart', onStart)
  }

  dom.style.display = 'block'
  dom.style.position = 'relative'
  dom.style.zIndex = '0'

  wrapper.appendChild(dom)

  Object.entries(directions).forEach(([key, value]) => {
    if (value) {
      const handle = createResizeHandle(key as ResizableNodeViewDirection)
      wrapper.appendChild(handle)
      bindResizeToHandle(handle, key as ResizableNodeViewDirection)
    }
  })

  const container = document.createElement('div')

  container.classList.add('resize-container')
  container.dataset.resizeContainer = ''
  container.dataset.node = node.type.name

  container.appendChild(wrapper)

  return container
}
