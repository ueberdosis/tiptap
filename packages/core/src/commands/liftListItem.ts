import type { Fragment, Node as ProseMirrorNode, NodeRange, NodeType } from '@tiptap/pm/model'
import { liftListItem as originalLiftListItem } from '@tiptap/pm/schema-list'

import { changeListItemsType } from '../helpers/changeListItemsType.js'
import { getListItemRange } from '../helpers/getListItemRange.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { isList } from '../helpers/isList.js'
import { shiftSelection } from '../helpers/shiftSelection.js'
import type { CommandProps, Extensions, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    liftListItem: {
      /**
       * Create a command to lift the list item around the selection up into a wrapping list.
       * When the wrapping list has another item type, the item takes that type.
       * @param typeOrName The type or name of the node.
       * @returns True when the item was lifted.
       * @example editor.commands.liftListItem('listItem')
       */
      liftListItem: (typeOrName: string | NodeType) => ReturnType
    }
  }
}

// The item of another type wrapping the range's list, when that item sits in a list
const getParentListItem = (range: NodeRange, itemType: NodeType, extensions: Extensions) => {
  if (range.depth < 2) {
    return null
  }

  const parentItem = range.$from.node(range.depth - 1)
  const parentList = range.$from.node(range.depth - 2)

  if (parentItem.type === itemType || !isList(parentList.type.name, extensions)) {
    return null
  }

  return parentItem
}

// Nest `followers` under `item` as a sublist like `list`, joining an existing one of the same type
const nestFollowingItems = (item: ProseMirrorNode, list: ProseMirrorNode, followers: Fragment) => {
  const trailingSublist = item.lastChild

  if (trailingSublist?.type === list.type) {
    const merged = trailingSublist.copy(trailingSublist.content.append(followers))

    return item.copy(item.content.replaceChild(item.childCount - 1, merged))
  }

  return item.copy(item.content.addToEnd(list.copy(followers)))
}

// The range's items, with the items after the range nested under the last one
const getItemsWithFollowers = (range: NodeRange) => {
  const list = range.parent
  const listStart = range.$from.start(range.depth)
  const items = list.content.cut(range.start - listStart, range.end - listStart)
  const followers = list.content.cut(range.end - listStart)

  if (followers.childCount === 0) {
    return items
  }

  const lastItem = nestFollowingItems(list.child(range.endIndex - 1), list, followers)

  return items.replaceChild(items.childCount - 1, lastItem)
}

const canLiftItems = (range: NodeRange, items: Fragment) => {
  const { $from } = range
  const parentItem = $from.node(range.depth - 1)
  const parentList = $from.node(range.depth - 2)
  const parentItemIndex = $from.index(range.depth - 2)
  const listIndex = $from.index(range.depth - 1)
  const removesList = range.startIndex === 0

  if (removesList && !parentItem.canReplace(listIndex, listIndex + 1)) {
    return false
  }

  return parentList.canReplace(parentItemIndex + 1, parentItemIndex + 1, items)
}

const liftIntoParentList = (itemType: NodeType, { editor, state, tr, dispatch }: CommandProps) => {
  const range = getListItemRange(state.selection, itemType)
  const parentItem = range && getParentListItem(range, itemType, editor.extensionManager.extensions)

  if (!range || !parentItem) {
    return false
  }

  const items = changeListItemsType(getItemsWithFollowers(range), parentItem.type)

  if (!items || !canLiftItems(range, items)) {
    return false
  }

  if (!dispatch) {
    return true
  }

  const { $from } = range
  const removesList = range.startIndex === 0
  const deleteFrom = removesList ? $from.before(range.depth) : range.start
  const deleteTo = removesList ? $from.after(range.depth) : $from.end(range.depth)
  const stepsBefore = tr.steps.length

  tr.delete(deleteFrom, deleteTo)

  // map only through this delete, earlier steps of a chain are already in `$from`
  const insertPos = tr.mapping.slice(stepsBefore).map($from.after(range.depth - 1))

  tr.insert(insertPos, items)
  shiftSelection(tr, state.selection, insertPos - range.start)

  return true
}

export const liftListItem: RawCommands['liftListItem'] = typeOrName => props => {
  const { state, dispatch } = props
  const type = getNodeType(typeOrName, state.schema)

  if (liftIntoParentList(type, props)) {
    return true
  }

  return originalLiftListItem(type)(state, dispatch)
}
