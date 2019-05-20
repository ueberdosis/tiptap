import { wrapInList, liftListItem } from 'prosemirror-schema-list'

function isList(node, schema) {
  return (node.type === schema.nodes.bullet_list || node.type === schema.nodes.ordered_list)
}

export default function toggleList(listType) {
  return (state, dispatch) => {
    const { schema } = state
    const lift = liftListItem(schema.nodes.list_item)
    const wrap = wrapInList(listType)
    const { $from, $to } = state.selection
    const range = $from.blockRange($to)
    const depthOffset = range.depth > 1 ? ((range.depth + 1) % 2) : 0
    if (!range) {
      return false
		}

    if (range.depth >= 1 && $from.node(range.depth - depthOffset).type === listType) {
      return lift(state, dispatch)
    }

    if (range.depth >= 1 && isList($from.node(range.depth - depthOffset), schema)) {
      const { tr } = state
      const $insert = state.doc.resolve(range.start - depthOffset)
      tr.setNodeMarkup(range.start - (1 + depthOffset) - $insert.parentOffset, listType)
      if (dispatch) dispatch(tr)
      return false
    }

    return wrap(state, dispatch)
  }
}
