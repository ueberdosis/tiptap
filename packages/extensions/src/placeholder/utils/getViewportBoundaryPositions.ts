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

  // No usable layout (detached, `display: none` ancestor, or collapsed to zero
  // in one dimension during a transition). A zero width or height means we
  // cannot probe a coordinate inside the box, so treat it as non-measurable.
  if (editorRect.width <= 0 || editorRect.height <= 0) {
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

  // Pick the x-coordinate based on text direction. In LTR the content starts
  // at the left edge; in RTL it starts at the right edge. Clamp it strictly
  // inside the editor bounds so a too-narrow box does not push the probe
  // outside and make `posAtCoords` return null for a non-occlusion reason.
  const minX = editorRect.left + 1
  const maxX = editorRect.right - 1

  if (minX > maxX) {
    return null
  }

  const isRTL = getComputedStyle(view.dom).direction === 'rtl'
  const targetX = isRTL ? editorRect.right - 2 : editorRect.left + 2
  const x = Math.min(Math.max(targetX, minX), maxX)

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

  // A null here (after clamping inside the box) usually means the editor is
  // occluded, but `posAtCoords` can also return null for benign reasons (a
  // probe over padding, browser caret-from-point gaps). Either way the result
  // is unreliable, so freeze the previous window rather than decorating the
  // whole doc — at worst a node is briefly under-decorated until the next
  // scroll/resize/focus recompute, which is preferable to flickering.
  if (!topPos || !bottomPos) {
    return null
  }

  return { top: topPos.pos, bottom: bottomPos.pos }
}
