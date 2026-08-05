import type { Editor } from '@tiptap/core'

/**
 * Check whether a node is shown, or hidden inside a folded details block.
 */
export const isNodeVisible = (position: number, editor: Editor): boolean => {
  const node = editor.view.domAtPos(position).node
  // Use the node for elements and its parent for text nodes.
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement

  if (!element) {
    return false
  }

  // Hidden elements have no offset parent.
  const isOpen = element.offsetParent !== null

  return isOpen
}
