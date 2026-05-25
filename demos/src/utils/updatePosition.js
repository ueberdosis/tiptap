import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { posToDOMRect } from '@tiptap/vue-3'

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

  const rect =
    clientRect || (editor ? posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to) : null)

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
