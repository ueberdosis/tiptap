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
    if (!range) {
      return false
		}

    if (range.depth >= 1 && $from.node(range.depth).type === listType) {
      return lift(state, dispatch)
    }

    if (range.depth >= 1 && isList($from.node(range.depth), schema)) {
      const { tr } = state
      tr.setNodeMarkup(range.start - 1, listType)
      if (dispatch) dispatch(tr)
      return false
    }

    return wrap(state, dispatch)
  }
}
