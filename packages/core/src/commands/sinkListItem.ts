import type { NodeRange, NodeType } from '@tiptap/pm/model'
import { sinkListItem as originalSinkListItem } from '@tiptap/pm/schema-list'

import { changeListItemsType } from '../helpers/changeListItemsType.js'
import { getListItemRange } from '../helpers/getListItemRange.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { isList } from '../helpers/isList.js'
import { shiftSelection } from '../helpers/shiftSelection.js'
import type { CommandProps, Extensions, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sinkListItem: {
      /**
       * Sink the list item down into an inner list. When the previous item ends
       * with a list of another type, the item joins that list and takes its item type.
       * @param typeOrName The type or name of the node.
       * @example editor.commands.sinkListItem('listItem')
       */
      sinkListItem: (typeOrName: string | NodeType) => ReturnType
    }
  }
}

// The list of another type that ends the item before the range, if any
const getPreviousSublist = (range: NodeRange, extensions: Extensions) => {
  if (range.startIndex === 0) {
    return null
  }

  const list = range.parent
  const sublist = list.child(range.startIndex - 1).lastChild

  if (!sublist || sublist.type === list.type || !isList(sublist.type.name, extensions)) {
    return null
  }

  return sublist
}

const sinkIntoPreviousSublist = (
  itemType: NodeType,
  { editor, state, tr, dispatch }: CommandProps,
) => {
  const range = getListItemRange(state.selection, itemType)
  const sublist = range && getPreviousSublist(range, editor.extensionManager.extensions)

  if (!range || !sublist) {
    return false
  }

  const listStart = range.$from.start(range.depth)
  const rangeItems = range.parent.content.cut(range.start - listStart, range.end - listStart)
  const sublistItemType = sublist.type.contentMatch.defaultType
  const items = sublistItemType && changeListItemsType(rangeItems, sublistItemType)

  if (!items || !sublist.canReplace(sublist.childCount, sublist.childCount, items)) {
    return false
  }

  if (!dispatch) {
    return true
  }

  // two closing tokens back: the sublist's and the previous item's
  const insertPos = range.start - 2

  tr.delete(range.start, range.end).insert(insertPos, items)
  shiftSelection(tr, state.selection, insertPos - range.start)

  return true
}

export const sinkListItem: RawCommands['sinkListItem'] = typeOrName => props => {
  const { state, dispatch } = props
  const type = getNodeType(typeOrName, state.schema)

  if (sinkIntoPreviousSublist(type, props)) {
    return true
  }

  return originalSinkListItem(type)(state, dispatch)
}
