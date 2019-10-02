export default function (type) {
  return (state, dispatch) => {
    const { empty, $cursor } = state.selection
    let { from, to } = state.selection

    if (empty && $cursor) {
      const { parent, pos, textOffset } = $cursor
      const parentOffset = pos - textOffset
      const { node: { nodeSize } } = parent.childAfter(parentOffset)

      from = parentOffset
      to = from + nodeSize
    }

    return dispatch(state.tr.removeMark(from, to, type))
  }
}
