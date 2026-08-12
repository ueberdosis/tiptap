import { Fragment } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'

import { getBranchingNestedListAtCursor } from './getBranchingNestedListAtCursor.js'

/**
 * Hoists all list items from a branching nested list after the cursor into the parent list.
 *
 * Use this when `joinForward` cannot restructure a nested list that contains list items
 * with sublists (see issue #6906).
 *
 * @param state - The editor state to transform.
 * @param dispatch - Optional dispatch function for the transaction.
 * @param itemName - The list item node name (for example `listItem` or `taskItem`).
 * @param wrapperNames - List wrapper node names (for example `bulletList` and `orderedList`).
 * @returns `true` when the nested list was hoisted, otherwise `false`.
 *
 * @example
 * ```ts
 * // Cursor at the end of "Item 1" before a nested list with branching items.
 * hoistBranchingNestedList(editor.state, editor.view.dispatch, 'listItem', [
 *   'bulletList',
 *   'orderedList',
 * ])
 * ```
 */
export const hoistBranchingNestedList = (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | undefined,
  itemName: string,
  wrapperNames: string[],
) => {
  const context = getBranchingNestedListAtCursor(state, itemName, wrapperNames)

  if (!context) {
    return false
  }

  const { selection } = state
  const { nestedList, nestedListPos, insertPos, items } = context
  const tr = state.tr

  tr.delete(nestedListPos, nestedListPos + nestedList.nodeSize)

  const mappedInsertPos = tr.mapping.map(insertPos)

  tr.insert(mappedInsertPos, Fragment.from(items))

  tr.setSelection(selection.map(tr.doc, tr.mapping))

  if (dispatch) {
    dispatch(tr)
  }

  return true
}
