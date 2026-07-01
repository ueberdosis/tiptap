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

  // No usable layout — can't probe a coordinate inside the box.
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

  // Probe the start edge (left in LTR, right in RTL), clamped inside the box
  // so a too-narrow editor doesn't push the probe out.
  const minX = editorRect.left + 1
  const maxX = editorRect.right - 1

  if (minX > maxX) {
    return null
  }

  const isRTL = getComputedStyle(view.dom).direction === 'rtl'
  const targetX = isRTL ? editorRect.right - 2 : editorRect.left + 2
  const x = Math.min(Math.max(targetX, minX), maxX)

  // Clamp the probe y inside the box so the overscan doesn't push it past the
  // editor's own content (which would make `posAtCoords` null for no reason).
  const probeTop = Math.max(visibleTop + 2, editorRect.top + 1)
  const probeBottom = Math.min(visibleBottom - 2, editorRect.bottom - 1)

  if (probeTop > probeBottom) {
    return null
  }

  const topPos = view.posAtCoords({ left: x, top: probeTop })
  const bottomPos = view.posAtCoords({ left: x, top: probeBottom })

  // Null usually means occlusion (but can be benign). Either way it's
  // unreliable, so freeze the previous window instead of decorating the whole doc.
  if (!topPos || !bottomPos) {
    return null
  }

  return { top: topPos.pos, bottom: bottomPos.pos }
}
