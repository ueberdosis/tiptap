export default function (range, type, attrs = {}) {
  return (state, dispatch) => {
    const { $from } = state.selection
    const index = $from.index()

    if (!$from.parent.canReplaceWith(index, index, type)) {
      return false
    }

    if (dispatch) {
      dispatch(state.tr.replaceWith(range.from, range.to, type.create(attrs)))
    }

    return true
  }
}
