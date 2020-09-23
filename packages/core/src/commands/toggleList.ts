import { Command } from '../Editor'
import { wrapInList, liftListItem } from 'prosemirror-schema-list'
import { findParentNode } from 'prosemirror-utils'
import { Node, NodeType, Schema } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

type ToggleListCommand = (
  listType: string | NodeType,
  itemType: string | NodeType,
) => Command

declare module '../Editor' {
  interface Commands {
    toggleList: ToggleListCommand,
  }
}

function isList(node: Node, schema: Schema) {
  return (node.type === schema.nodes.bullet_list
    || node.type === schema.nodes.ordered_list
    || node.type === schema.nodes.todo_list)
}

export const toggleList: ToggleListCommand = (listTypeOrName, itemTypeOrName) => ({ tr, state, dispatch }) => {
  const listType = getNodeType(listTypeOrName, state.schema)
  const itemType = getNodeType(itemTypeOrName, state.schema)
  const { schema, selection } = state
  const { $from, $to } = selection
  const range = $from.blockRange($to)

  if (!range) {
    return false
  }

  const parentList = findParentNode(node => isList(node, schema))(selection)

  if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
    if (parentList.node.type === listType) {
      return liftListItem(itemType)(state, dispatch)
    }

    if (isList(parentList.node, schema) && listType.validContent(parentList.node.content)) {
      tr.setNodeMarkup(parentList.pos, listType)

      return false
    }
  }

  return wrapInList(listType)(state, dispatch)
}
