import type { NodeType } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'

/**
 * Get the block range of the list items around the selection, or null when
 * the selection is not inside a list of `itemType`.
 */
export function getListItemRange(selection: Selection, itemType: NodeType) {
  const { $from, $to } = selection

  return $from.blockRange($to, node => node.childCount > 0 && node.firstChild?.type === itemType)
}
