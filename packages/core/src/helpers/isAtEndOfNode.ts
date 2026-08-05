import type { EditorState } from '@tiptap/pm/state'

import { findParentNode } from './findParentNode.js'

/**
 * Check whether the cursor sits at the end of its parent node.
 * @param nodeType Look at the closest parent of this type instead.
 */
export const isAtEndOfNode = (state: EditorState, nodeType?: string) => {
  const { $from, $to, $anchor } = state.selection

  if (nodeType) {
    const parentNode = findParentNode(node => node.type.name === nodeType)(state.selection)

    if (!parentNode) {
      return false
    }

    const $parentPos = state.doc.resolve(parentNode.pos + 1)

    if ($anchor.pos + 1 === $parentPos.end()) {
      return true
    }

    return false
  }

  if ($to.parentOffset < $to.parent.nodeSize - 2 || $from.pos !== $to.pos) {
    return false
  }

  return true
}
