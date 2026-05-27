import type { Node } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

import { VIEWPORT_OVERSCAN_PX } from '../constants.js'

function getContainerRect(container: HTMLElement | Window): { top: number; bottom: number } {
  if (container === window) {
    return { top: 0, bottom: window.innerHeight }
  }

  return (container as HTMLElement).getBoundingClientRect()
}

export function getViewportBoundaryPositions({
  doc,
  view,
  scrollContainer,
}: {
  doc: Node
  view: EditorView
  scrollContainer?: HTMLElement | Window
}) {
  const editorRect = view.dom.getBoundingClientRect()
  const containerRect = scrollContainer
    ? getContainerRect(scrollContainer)
    : { top: 0, bottom: window.innerHeight }

  const visibleTop = Math.max(editorRect.top, containerRect.top) - VIEWPORT_OVERSCAN_PX
  const visibleBottom = Math.min(editorRect.bottom, containerRect.bottom) + VIEWPORT_OVERSCAN_PX

  if (visibleTop >= visibleBottom) {
    // Editor is not visible — fall back to full document range
    return { top: 0, bottom: doc.content.size }
  }

  // Pick the x-coordinate based on text direction. In LTR the content
  // starts at the left edge; in RTL it starts at the right edge.
  // Clamp to ensure the coordinate stays inside the editor bounds.
  const isRTL = getComputedStyle(view.dom).direction === 'rtl'
  const x = isRTL ? Math.max(editorRect.right - 2, editorRect.left + 2) : editorRect.left + 2

  const topPos = view.posAtCoords({ left: x, top: visibleTop + 2 })
  const bottomPos = view.posAtCoords({ left: x, top: visibleBottom - 2 })

  return {
    top: topPos ? topPos.pos : 0,
    bottom: bottomPos ? bottomPos.pos : doc.content.size,
  }
}
