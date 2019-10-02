export default function (type, attrs) {
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

    return dispatch(state.tr.addMark(from, to, type.create(attrs)))
  }
}
