import type { Selection } from '@tiptap/pm/state'

import { isTextSelection } from './isTextSelection.js'

/**
 * Cheap pre-check for `isNodeViewSelected`: can a node of this size be selected
 * by this selection at all, no matter where it sits in the document?
 *
 * Reading a node view's position costs O(siblings) in ProseMirror, so in large
 * documents it pays off to skip that lookup when the answer cannot be `true`.
 *
 * @param selection The current editor selection.
 * @param nodeSize The size of the node.
 * @param selectedOnTextSelection When `true`, a selection inside the node also counts as selected.
 * @returns `false` only if `isNodeViewSelected` cannot return `true` for this node size.
 * @example
 * ```js
 * // A collapsed cursor can never cover a node, so skip the position lookup.
 * canNodeViewBeSelected({ selection: state.selection, nodeSize: node.nodeSize })
 * ```
 */
export function canNodeViewBeSelected({
  selection,
  nodeSize,
  selectedOnTextSelection = false,
}: {
  selection: Selection
  nodeSize: number
  selectedOnTextSelection?: boolean
}): boolean {
  // A node is covered when `from <= pos` and `to >= pos + nodeSize`,
  // which is only possible if the selection spans at least the node.
  if (selection.to - selection.from >= nodeSize) {
    return true
  }

  return selectedOnTextSelection && isTextSelection(selection)
}
