import type { Editor } from '@tiptap/core'

import { hoistBranchingNestedList } from './hoistBranchingNestedList.js'

/**
 * Handles Delete for a list item when a branching nested sublist follows the cursor.
 *
 * @param editor - The editor instance whose state should be updated.
 * @param itemName - The list item node name (for example `listItem` or `taskItem`).
 * @param wrapperNames - List wrapper node names (for example `bulletList` and `orderedList`).
 * @returns `true` when the nested list was hoisted, otherwise `false`.
 *
 * @example
 * ```ts
 * Delete: () =>
 *   handleDeleteBranchingNestedList(editor, 'listItem', ['bulletList', 'orderedList']),
 * ```
 */
export const handleDeleteBranchingNestedList = (
  editor: Editor,
  itemName: string,
  wrapperNames: string[],
) => {
  return hoistBranchingNestedList(editor.state, editor.view.dispatch, itemName, wrapperNames)
}
