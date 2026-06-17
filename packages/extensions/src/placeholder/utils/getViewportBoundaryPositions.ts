import type { EditorView } from '@tiptap/pm/view'

import { VIEWPORT_OVERSCAN_PX } from '../constants.js'

function getContainerRect(container: HTMLElement | Window): { top: number; bottom: number } {
  if (container === window) {
    return { top: 0, bottom: window.innerHeight }
  }

  return (container as HTMLElement).getBoundingClientRect()
}

/**
 * Computes the document positions bounding the currently visible viewport.
 */
export function getViewportBoundaryPositions({
  view,
  scrollContainer,
}: {
  view: EditorView
  scrollContainer?: HTMLElement | Window
}): { top: number; bottom: number } | null {
  const editorRect = view.dom.getBoundingClientRect()

  // No layout yet (detached, `display: none` ancestor, not painted).
  if (editorRect.width === 0 && editorRect.height === 0) {
    return null
  }

  const containerRect = scrollContainer
    ? getContainerRect(scrollContainer)
    : { top: 0, bottom: window.innerHeight }

  const visibleTop = Math.max(editorRect.top, containerRect.top) - VIEWPORT_OVERSCAN_PX
  const visibleBottom = Math.min(editorRect.bottom, containerRect.bottom) + VIEWPORT_OVERSCAN_PX

  if (visibleTop >= visibleBottom) {
    // Editor is scrolled fully out of its container so not measurable.
    return null
  }

  // Pick the x-coordinate based on text direction. In LTR the content
  // starts at the left edge; in RTL it starts at the right edge.
  // Clamp to ensure the coordinate stays inside the editor bounds.
  const isRTL = getComputedStyle(view.dom).direction === 'rtl'
  const x = isRTL ? Math.max(editorRect.right - 2, editorRect.left + 2) : editorRect.left + 2

  // Clamp the probe y-coordinates strictly inside the editor box. The ±200px
  // overscan can push the probe above/below the editor's own content even when
  // it is fully visible, which would make `posAtCoords` return null for a
  // legitimate reason. Clamping means a null result reliably signals occlusion.
  const probeTop = Math.max(visibleTop + 2, editorRect.top + 1)
  const probeBottom = Math.min(visibleBottom - 2, editorRect.bottom - 1)

  if (probeTop > probeBottom) {
    return null
  }

  const topPos = view.posAtCoords({ left: x, top: probeTop })
  const bottomPos = view.posAtCoords({ left: x, top: probeBottom })

  // A null here (after clamping inside the box) means something is covering the
  // editor — freeze the previous window instead of decorating the whole doc.
  if (!topPos || !bottomPos) {
    return null
  }

  return { top: topPos.pos, bottom: bottomPos.pos }
}
