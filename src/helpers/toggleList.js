import { nodeIsActive } from '../utils'
import { wrapInList, liftListItem } from '../helpers'

export default function toggleList(type, itemType) {
  return (state, dispatch, view) => {
    const isActive = nodeIsActive(state, type)

    if (isActive) {
      return liftListItem(itemType)(state, dispatch, view)
    }

    return wrapInList(type)(state, dispatch, view)
  }
}

// https://discuss.prosemirror.net/t/list-type-toggle/948

// import { wrapInList, liftListItem } from 'prosemirror-schema-list'

// function isList(node, schema) {
//   return (node.type === schema.nodes.bullet_list || node.type === schema.nodes.ordered_list)
// }

// export default function toggleList(listType, schema) {
//   const lift = liftListItem(schema.nodes.list_item)
// 	const wrap = wrapInList(listType)

//   return (state, dispatch) => {
//     const { $from, $to } = state.selection
//     const range = $from.blockRange($to)
//     if (!range) {
//       return false
// 		}

//     if (range.depth >= 2 && $from.node(range.depth - 1).type === listType) {
//       return lift(state, dispatch)
//     } else if (range.depth >= 2 && isList($from.node(range.depth - 1), schema)) {
//       const tr = state.tr
// 			const node = $from.before(range.depth - 1)
// 			console.log({node})
//       // TODO: how do I pass the node above to `setNodeType`?
//       // tr.setNodeType(range.start, listType);
//       if (dispatch) dispatch(tr)
//       return false
//     } else {
//       return wrap(state, dispatch)
//     }
//   }
// }
