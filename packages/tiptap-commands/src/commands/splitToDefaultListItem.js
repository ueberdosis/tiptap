// this is a copy of canSplit
// see https://github.com/ProseMirror/prosemirror-transform/blob/master/src/structure.js

function canSplit(doc, pos, depth = 1, typesAfter) {
  let $pos = doc.resolve(pos), base = $pos.depth - depth
  let innerType = (typesAfter && typesAfter[typesAfter.length - 1]) || $pos.parent
  if (base < 0 || $pos.parent.type.spec.isolating ||
      !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) ||
      !innerType.type.validContent($pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount)))
    return false
  for (let d = $pos.depth - 1, i = depth - 2; d > base; d--, i--) {
    let node = $pos.node(d), index = $pos.index(d)
    if (node.type.spec.isolating) return false
    let rest = node.content.cutByIndex(index, node.childCount)
    let after = (typesAfter && typesAfter[i]) || node
		if (after != node) rest = rest.replaceChild(0, after.type.create(after.attrs))

		/* Change starts from here */
		// if (!node.canReplace(index + 1, node.childCount) || !after.type.validContent(rest))
    //   return false
    if (!node.canReplace(index + 1, node.childCount))
      return false
		/* Change ends here */
  }
  let index = $pos.indexAfter(base)
  let baseType = typesAfter && typesAfter[0]
  return $pos.node(base).canReplaceWith(index, index, baseType ? baseType.type : $pos.node(base + 1).type)
}

// this is a copy of splitListItem
// see https://github.com/ProseMirror/prosemirror-schema-list/blob/master/src/schema-list.js

export default function (itemType) {
  return function(state, dispatch) {
    let {$from, $to, node} = state.selection
    if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) return false
    let grandParent = $from.node(-1)
    if (grandParent.type != itemType) return false
    if ($from.parent.content.size == 0) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if ($from.depth == 2 || $from.node(-3).type != itemType ||
					$from.index(-2) != $from.node(-2).childCount - 1) return false

      if (dispatch) {
        let wrap = Fragment.empty, keepItem = $from.index(-1) > 0
        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (let d = $from.depth - (keepItem ? 1 : 2); d >= $from.depth - 3; d--)
          wrap = Fragment.from($from.node(d).copy(wrap))
        // Add a second list item with an empty default start node
				wrap = wrap.append(Fragment.from(itemType.createAndFill()))
        let tr = state.tr.replace($from.before(keepItem ? null : -1), $from.after(-3), new Slice(wrap, keepItem ? 3 : 2, 2))
        tr.setSelection(state.selection.constructor.near(tr.doc.resolve($from.pos + (keepItem ? 3 : 2))))
        dispatch(tr.scrollIntoView())
      }
      return true
    }
		let nextType = $to.pos == $from.end() ? grandParent.contentMatchAt($from.indexAfter(-1)).defaultType : null
		let tr = state.tr.delete($from.pos, $to.pos)

		/* Change starts from here */
		// let types = nextType && [null, {type: nextType}]
    let types = nextType && [{type: itemType}, {type: nextType}]
    if (!types) types = [{type: itemType}, null]
		/* Change ends here */

		if (!canSplit(tr.doc, $from.pos, 2, types)) return false
    if (dispatch) dispatch(tr.split($from.pos, 2, [{type: state.schema.nodes.todo_item, attrs: { done: false }}]).scrollIntoView())
    return true
  }
}