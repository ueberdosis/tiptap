import { Fragment } from 'prosemirror-model'

export default function (range = null, type, attrs = {}, fragment = Fragment.empty) {
  return (state, dispatch) => {
    const { $from, $to } = state.selection
    const index = $from.index()
    const from = range ? range.from : $from.pos
    const to = range ? range.to : $to.pos

    if (!$from.parent.canReplaceWith(index, index, type)) {
      return false
    }

    if (dispatch) {
      dispatch(state.tr.replaceWith(from, to, type.create(attrs, fragment)))
    }

    return true
  }
}
