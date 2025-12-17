import type { Editor } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

export type FindElementNextToCoords = {
  x: number
  y: number
  direction?: 'left' | 'right'
  editor: Editor
}

/**
 * Finds the draggable block element that is a direct child of view.dom
 */
export function findClosestTopLevelBlock(element: Element, view: EditorView): HTMLElement | undefined {
  let current: Element | null = element

  while (current?.parentElement && current.parentElement !== view.dom) {
    current = current.parentElement
  }

  return current?.parentElement === view.dom ? (current as HTMLElement) : undefined
}

/**
 * Clamps coordinates to content bounds with O(1) layout reads
 */
function clampToContent(view: EditorView, x: number, y: number, inset = 5): { x: number; y: number } {
  const container = view.dom
  const firstBlock = container.firstElementChild
  const lastBlock = container.lastElementChild

  if (!firstBlock || !lastBlock) {
    // this condition will never be met, as the first child element will be treated as last child element too
    return { x, y }
  }

  // Clamp Y between first and last block
  const topRect = firstBlock.getBoundingClientRect()
  const botRect = lastBlock.getBoundingClientRect()
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

  // Clamp X to the chosen block’s bounds
  const clampedX = Math.min(Math.max(rowRect.left + inset, x), rowRect.right - inset)

  return { x: clampedX, y: clampedY }
}

export const findElementNextToCoords = (
  options: FindElementNextToCoords,
): {
  resultElement: HTMLElement | null
  resultNode: Node | null
  pos: number | null
} => {
  const { x, y, editor } = options
  const { view, state } = editor

  const { x: clampedX, y: clampedY } = clampToContent(view, x, y, 5)

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
