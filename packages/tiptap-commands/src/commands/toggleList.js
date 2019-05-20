import { wrapInList, liftListItem } from 'prosemirror-schema-list'
import { findParentNode } from 'prosemirror-utils'

function isList(node, schema) {
  return (node.type === schema.nodes.bullet_list || node.type === schema.nodes.ordered_list)
}

export default function toggleList(listType) {
  return (state, dispatch) => {
    const { schema, selection } = state
    const lift = liftListItem(schema.nodes.list_item)
    const wrap = wrapInList(listType)
    const { $from, $to } = selection
    const range = $from.blockRange($to)
    if (!range) {
      return false
		}

    const parentList = findParentNode(node => isList(node, schema))(selection)

    if (range.depth >= 1 && parentList) {
      if (parentList.node.type === listType) {
        return lift(state, dispatch)
      }

      if (isList(parentList.node, schema)) {
        const { tr } = state
        tr.setNodeMarkup(parentList.pos, listType)
        if (dispatch) dispatch(tr)
        return false
      }
    }

    return wrap(state, dispatch)
  }
}
