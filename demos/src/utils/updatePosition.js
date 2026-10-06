import { computePosition, flip, offset, shift } from '@floating-ui/dom'

function getSelectionClientRect(editor) {
  const { from } = editor.state.selection
  const { left, right, top, bottom } = editor.view.coordsAtPos(from)

  return new DOMRect(left, top, right - left, bottom - top)
}

export function updatePosition({
  editor,
  clientRect,
  element,
  placement = 'bottom-start',
  strategy = 'absolute',
  middleware = [shift(), flip()],
  offsetValue,
}) {
  if (!element) {
    return
  }

  const rect = clientRect || (editor ? getSelectionClientRect(editor) : null)

  if (!rect) {
    return
  }

  const virtualElement = {
    getBoundingClientRect: () => rect,
  }

  const resolvedMiddleware = offsetValue ? [offset(offsetValue), ...middleware] : middleware

  return computePosition(virtualElement, element, {
    placement,
    strategy,
    middleware: resolvedMiddleware,
  }).then(({ x, y, strategy: resolvedStrategy }) => {
    Object.assign(element.style, {
      width: 'max-content',
      position: resolvedStrategy,
      left: `${x}px`,
      top: `${y}px`,
    })
  })
}
