import type { EditorState } from '@tiptap/pm/state'

/**
 * Returns true when the cursor is at the end of a textblock inside a list item,
 * the next sibling block is a list wrapper, and that nested list contains at least
 * one list item with content beyond a single paragraph (i.e. a sublist).
 */
export const hasBranchingNestedListAfterCursor = (
  state: EditorState,
  itemName: string,
  wrapperNames: string[],
) => {
  const { selection } = state

  // if the selection is not empty, there is no branching nested list after the cursor
  if (!selection.empty) {
    return false
  }

  const { $from } = selection

  // if the parent is not a textblock, there is no branching nested list after the cursor
  if (!$from.parent.isTextblock) {
    return false
  }

  // if the parent is not at the end of the content, there is no branching nested list after the cursor
  if ($from.parentOffset !== $from.parent.content.size) {
    return false
  }

  // find the depth of the list item
  let listItemDepth = -1

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === itemName) {
      listItemDepth = depth
      break
    }
  }

  // if the list item is not found, there is no branching nested list after the cursor
  if (listItemDepth < 0) {
    return false
  }

  const listItem = $from.node(listItemDepth)
  const indexInListItem = $from.index(listItemDepth)

  if (indexInListItem + 1 >= listItem.childCount) {
    return false
  }

  const nextChild = listItem.child(indexInListItem + 1)

  if (!wrapperNames.includes(nextChild.type.name)) {
    return false
  }

  const itemType = state.schema.nodes[itemName]
  let hasBranching = false

  nextChild.forEach(child => {
    if (child.type === itemType && child.childCount > 1) {
      hasBranching = true
    }
  })

  return hasBranching
}
