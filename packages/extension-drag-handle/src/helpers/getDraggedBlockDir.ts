import type { EditorView } from '@tiptap/pm/view'

/**
 * Resolves the DOM element that visually represents the dragged block.
 */
export function getDraggedBlockElement(view: EditorView, pos: number): Element | null {
  const nodeDom = view.nodeDOM(pos)

  if (nodeDom instanceof Element && nodeDom !== view.dom) {
    return nodeDom
  }

  const { node, offset } = view.domAtPos(pos)
  const child = node.childNodes[offset]

  if (child instanceof Element) {
    return child
  }

  if (node instanceof Element) {
    return node
  }

  if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
    return node.parentElement
  }

  return null
}

/**
 * Resolves the text direction (`dir` attribute value) for the block being
 * dragged. Uses `view.nodeDOM` first because it maps a ProseMirror position
 * directly to the block-level DOM element. Falls back to `view.domAtPos` with
 * proper child-at-offset resolution when `nodeDOM` doesn't return an element,
 * and ultimately to the editor root direction.
 */
export function getDraggedBlockDir(view: EditorView, pos: number): string {
  const draggedDom = getDraggedBlockElement(view, pos)

  const contentDir = draggedDom ? getComputedStyle(draggedDom).direction : getComputedStyle(view.dom).direction

  return contentDir || 'ltr'
}
