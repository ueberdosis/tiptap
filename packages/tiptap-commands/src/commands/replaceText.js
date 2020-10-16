export default function (range = null, type, content = []) {
  return (state, dispatch) => {
    const { $from, $to } = state.selection
    const index = $from.index()
    const from = range ? range.from : $from.pos
    const to = range ? range.to : $to.pos

    if (!$from.parent.canReplaceWith(index, index, type)) {
      return false
    }

    if (dispatch) {
      dispatch(state.tr.replaceWith(from, to, content))
    }

    return true
  }
}
