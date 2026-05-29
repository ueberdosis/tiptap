import type { EditorState } from '@tiptap/pm/state'

import { getBranchingNestedListAtCursor } from './getBranchingNestedListAtCursor.js'

/**
 * Returns whether the cursor is at the end of a list item textblock and the next
 * sibling is a nested list that contains at least one branching list item.
 *
 * @param state - The editor state to inspect.
 * @param itemName - The list item node name (for example `listItem` or `taskItem`).
 * @param wrapperNames - List wrapper node names (for example `bulletList` and `orderedList`).
 * @returns `true` when {@link hoistBranchingNestedList} should handle Delete.
 *
 * @example
 * ```ts
 * if (hasBranchingNestedListAfterCursor(editor.state, 'listItem', ['bulletList', 'orderedList'])) {
 *   hoistBranchingNestedList(editor.state, editor.view.dispatch, 'listItem', [
 *     'bulletList',
 *     'orderedList',
 *   ])
 * }
 * ```
 */
export const hasBranchingNestedListAfterCursor = (
  state: EditorState,
  itemName: string,
  wrapperNames: string[],
): boolean => {
  return getBranchingNestedListAtCursor(state, itemName, wrapperNames) !== null
}
