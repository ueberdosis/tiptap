import { Fragment, type Node } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'

import { hasBranchingNestedListAfterCursor } from './hasBranchingNestedListAfterCursor.js'

const findListItemDepth = ($from: EditorState['selection']['$from'], itemName: string) => {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === itemName) {
      return depth
    }
  }

  return -1
}

/**
 * Hoists all list items from the nested list after the cursor into the parent list.
 * Used when joinForward cannot restructure a nested list that contains branching items.
 */
export const hoistBranchingNestedList = (
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | undefined,
  itemName: string,
  wrapperNames: string[],
) => {
  if (!hasBranchingNestedListAfterCursor(state, itemName, wrapperNames)) {
    return false
  }

  const { selection } = state
  const { $from } = selection
  const listItemDepth = findListItemDepth($from, itemName)

  if (listItemDepth < 0) {
    return false
  }

  const nodeAfter = state.doc.resolve($from.after()).nodeAfter

  if (!nodeAfter || !wrapperNames.includes(nodeAfter.type.name)) {
    return false
  }

  const nestedList = nodeAfter
  const nestedListPos = $from.after()
  const insertPos = $from.after(listItemDepth)
  const items: Node[] = []

  nestedList.forEach(child => {
    items.push(child)
  })

  if (items.length === 0) {
    return false
  }

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
