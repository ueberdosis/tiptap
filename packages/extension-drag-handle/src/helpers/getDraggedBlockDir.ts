import type { EditorView } from '@tiptap/pm/view'

/**
 * Resolves the text direction (`dir` attribute value) for the block being
 * dragged. Uses `view.nodeDOM` first because it maps a ProseMirror position
 * directly to the block-level DOM element. Falls back to `view.domAtPos` with
 * proper child-at-offset resolution when `nodeDOM` doesn't return an element,
 * and ultimately to the editor root direction.
 */
export function getDraggedBlockDir(view: EditorView, pos: number): string {
  let draggedDom: Element | null = null
  const nodeDom = view.nodeDOM(pos)

  if (nodeDom instanceof Element) {
    draggedDom = nodeDom
  } else {
    const { node, offset } = view.domAtPos(pos)
    const child = node.childNodes[offset]

    if (child instanceof Element) {
      draggedDom = child
    } else if (node instanceof Element) {
      draggedDom = node
    } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
      draggedDom = node.parentElement
    }
  }

  const contentDir = draggedDom ? getComputedStyle(draggedDom).direction : getComputedStyle(view.dom).direction

  return contentDir || 'ltr'
}
