import type { Selection } from '@tiptap/pm/state'

import { isTextSelection } from './isTextSelection.js'

/**
 * Determines whether a node view should be considered selected for the given
 * editor selection.
 *
 * A node is considered selected when the current selection fully covers it
 * (e.g. a `NodeSelection`). When `selectedOnTextSelection` is enabled, the
 * node is additionally considered selected if a `TextSelection` is fully
 * contained within the node's range.
 *
 * @param selection The current editor selection.
 * @param pos The start position of the node in the document.
 * @param nodeSize The size of the node.
 * @param selectedOnTextSelection When `true`, also treat selections inside the node as selected.
 * @returns `true` if the node view should render as selected.
 */
export function isNodeViewSelected({
  selection,
  pos,
  nodeSize,
  selectedOnTextSelection = false,
}: {
  selection: Selection
  pos: number
  nodeSize: number
  selectedOnTextSelection?: boolean
}): boolean {
  const { from, to } = selection

  if (from <= pos && to >= pos + nodeSize) {
    return true
  }

  if (selectedOnTextSelection && isTextSelection(selection) && from > pos && to < pos + nodeSize) {
    return true
  }

  return false
}
