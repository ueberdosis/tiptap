import type { Node } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'

export type BranchingNestedListAtCursor = {
  listItemDepth: number
  nestedList: Node
  nestedListPos: number
  insertPos: number
  items: Node[]
}

/**
 * Resolves a branching nested list immediately after the cursor when the selection is
 * collapsed at the end of a textblock inside a list item.
 *
 * @param state - The editor state to inspect.
 * @param itemName - The list item node name (for example `listItem` or `taskItem`).
 * @param wrapperNames - List wrapper node names (for example `bulletList` and `orderedList`).
 * @returns Resolved positions and nodes for hoisting, or `null` when not applicable.
 *
 * @example
 * ```ts
 * const context = getBranchingNestedListAtCursor(editor.state, 'listItem', [
 *   'bulletList',
 *   'orderedList',
 * ])
 *
 * if (context) {
 *   // cursor is at the end of Item 1 before a branching nested sublist
 * }
 * ```
 */
export const getBranchingNestedListAtCursor = (
  state: EditorState,
  itemName: string,
  wrapperNames: string[],
): BranchingNestedListAtCursor | null => {
  const { selection } = state

  if (!selection.empty) {
    return null
  }

  const { $from } = selection

  if (!$from.parent.isTextblock) {
    return null
  }

  if ($from.parentOffset !== $from.parent.content.size) {
    return null
  }

  let listItemDepth = -1

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === itemName) {
      listItemDepth = depth
      break
    }
  }

  if (listItemDepth < 0) {
    return null
  }

  const listItem = $from.node(listItemDepth)
  const indexInListItem = $from.index(listItemDepth)

  if (indexInListItem + 1 >= listItem.childCount) {
    return null
  }

  const nextChild = listItem.child(indexInListItem + 1)

  if (!wrapperNames.includes(nextChild.type.name)) {
    return null
  }

  const itemType = state.schema.nodes[itemName]
  let hasBranching = false

  nextChild.forEach(child => {
    if (child.type === itemType && child.childCount > 1) {
      hasBranching = true
    }
  })

  if (!hasBranching) {
    return null
  }

  const nodeAfter = state.doc.resolve($from.after()).nodeAfter

  if (!nodeAfter || !wrapperNames.includes(nodeAfter.type.name)) {
    return null
  }

  const items: Node[] = []

  nodeAfter.forEach(child => {
    items.push(child)
  })

  if (items.length === 0) {
    return null
  }

  return {
    listItemDepth,
    nestedList: nodeAfter,
    nestedListPos: $from.after(),
    insertPos: $from.after(listItemDepth),
    items,
  }
}
