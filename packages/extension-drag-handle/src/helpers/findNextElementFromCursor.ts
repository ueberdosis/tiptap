import type { Editor } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

import type { NormalizedNestedOptions } from '../types/options.js'
import { findBestDragTarget } from './findBestDragTarget.js'

export type FindElementNextToCoords = {
  x: number
  y: number
  direction?: 'left' | 'right'
  editor: Editor
  nestedOptions?: NormalizedNestedOptions
}

/**
 * ProseMirror attaches a `pmViewDesc` to every DOM node it manages. Element view
 * descriptions for document nodes expose a `node`; widget decorations (such as
 * the Pages page-chrome overlay, which renders as a zero-height first child of
 * the editor) have a view description but no associated document node.
 */
interface ElementWithViewDesc extends Element {
  pmViewDesc?: { node?: unknown }
}

/**
 * Finds the draggable block element that is a direct child of view.dom.
 *
 * Direct children that are widget decorations rather than document content are
 * skipped — they are not draggable blocks, and treating them as such would
 * align the drag handle to the decoration (e.g. the page header) instead of the
 * actual first block on the page.
 */
export function findClosestTopLevelBlock(
  element: Element,
  view: EditorView,
): HTMLElement | undefined {
  let current: Element | null = element

  while (current?.parentElement && current.parentElement !== view.dom) {
    current = current.parentElement
  }

  if (current?.parentElement !== view.dom) {
    return undefined
  }

  // Skip widget decorations (no associated document node).
  if (!(current as ElementWithViewDesc).pmViewDesc?.node) {
    return undefined
  }

  return current as HTMLElement
}

/**
 * Checks if a DOMRect has valid, finite dimensions.
 */
function isValidRect(rect: DOMRect): boolean {
  return (
    Number.isFinite(rect.top) &&
    Number.isFinite(rect.bottom) &&
    Number.isFinite(rect.left) &&
    Number.isFinite(rect.right) &&
    rect.width > 0 &&
    rect.height > 0
  )
}

/**
 * Returns the bounding rect of the first or last child of `container` that has
 * a valid (non-zero) layout box.
 *
 * Some extensions insert zero-size widget decorations as the first/last child
 * of the editor — for example the Pages extension anchors its page-chrome
 * overlay in a zero-height `<div>` as the first child. Reading `firstElementChild`
 * / `lastElementChild` directly would yield an invalid rect and abort clamping,
 * so we skip over any edge children without a valid box.
 */
export function edgeBlockRect(container: Element, edge: 'first' | 'last'): DOMRect | null {
  let current: Element | null =
    edge === 'first' ? container.firstElementChild : container.lastElementChild

  while (current) {
    const rect = current.getBoundingClientRect()

    if (isValidRect(rect)) {
      return rect
    }

    current = edge === 'first' ? current.nextElementSibling : current.previousElementSibling
  }

  return null
}

/**
 * Clamps coordinates to content bounds with O(1) layout reads
 */
function clampToContent(
  view: EditorView,
  x: number,
  y: number,
  inset = 5,
): { x: number; y: number } | null {
  // Validate input coordinates are finite numbers
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  const container = view.dom

  // Clamp Y between the first and last children that actually have a layout box.
  const topRect = edgeBlockRect(container, 'first')
  const botRect = edgeBlockRect(container, 'last')

  if (!topRect || !botRect) {
    return null
  }

  const clampedY = Math.min(Math.max(topRect.top + inset, y), botRect.bottom - inset)

  const epsilon = 0.5
  const sameLeft = Math.abs(topRect.left - botRect.left) < epsilon
  const sameRight = Math.abs(topRect.right - botRect.right) < epsilon

  let rowRect: DOMRect = topRect

  if (sameLeft && sameRight) {
    // Most of the time, every block has the same width
    rowRect = topRect
  } else {
    // TODO
    // find the actual block at the clamped Y
    // This case is rare, avoid for now
  }

  // Clamp X to the chosen block's bounds
  const clampedX = Math.min(Math.max(rowRect.left + inset, x), rowRect.right - inset)

  // Final validation of output coordinates
  if (!Number.isFinite(clampedX) || !Number.isFinite(clampedY)) {
    return null
  }

  return { x: clampedX, y: clampedY }
}

export const findElementNextToCoords = (
  options: FindElementNextToCoords,
): {
  resultElement: HTMLElement | null
  resultNode: Node | null
  pos: number | null
} => {
  const { x, y, editor, nestedOptions } = options
  const { view, state } = editor

  const clamped = clampToContent(view, x, y, 5)

  // Return early if coordinates could not be clamped to valid bounds
  if (!clamped) {
    return { resultElement: null, resultNode: null, pos: null }
  }

  const { x: clampedX, y: clampedY } = clamped

  // When nested mode is enabled, use the scoring-based detection
  if (nestedOptions?.enabled) {
    const target = findBestDragTarget(view, { x: clampedX, y: clampedY }, nestedOptions)

    if (!target) {
      return { resultElement: null, resultNode: null, pos: null }
    }

    return {
      resultElement: target.dom,
      resultNode: target.node,
      pos: target.pos,
    }
  }

  // Original root-level detection for non-nested mode
  const elements = view.root.elementsFromPoint(clampedX, clampedY)

  let block: HTMLElement | undefined

  Array.prototype.some.call(elements, (el: Element) => {
    if (!view.dom.contains(el)) {
      return false
    }
    const candidate = findClosestTopLevelBlock(el, view)
    if (candidate) {
      block = candidate
      return true
    }
    return false
  })

  if (!block) {
    // elementsFromPoint may return nothing if the coordinates land outside an element
    // (e.g., in margins, overlays, gaps, or indented nodes). posAtCoords uses the
    // caret API, so it still resolves to the nearest text position.
    const coords = view.posAtCoords({ left: clampedX, top: clampedY })

    if (coords) {
      const $pos = state.doc.resolve(coords.pos)
      // Walk up to the top-level block
      const depth = Math.min($pos.depth, 1)
      const blockPos = depth > 0 ? $pos.before(depth) : $pos.pos
      const blockNode = state.doc.nodeAt(blockPos)

      if (blockNode) {
        const dom = view.nodeDOM(blockPos)

        return {
          resultElement: dom instanceof HTMLElement ? dom : null,
          resultNode: blockNode,
          pos: blockPos,
        }
      }
    }

    return { resultElement: null, resultNode: null, pos: null }
  }

  let pos: number
  try {
    pos = view.posAtDOM(block, 0)
  } catch {
    return { resultElement: null, resultNode: null, pos: null }
  }

  const node = state.doc.nodeAt(pos)

  if (!node) {
    // This case occurs when an atom node is allowed to contain inline content.
    // We need to resolve the position here to ensure we target the correct parent node.
    const resolvedPos = state.doc.resolve(pos)
    const parent = resolvedPos.parent

    return {
      resultElement: block,
      resultNode: parent,
      pos: resolvedPos.start(),
    }
  }

  return {
    resultElement: block,
    resultNode: node,
    pos,
  }
}
