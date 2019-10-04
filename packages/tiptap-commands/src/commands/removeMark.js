import { getMarkRange } from 'tiptap-utils'

export default function (type) {
  return (state, dispatch) => {
    let { from, to } = state.selection
    const { $from, empty } = state.selection

    if (empty) {
      const range = getMarkRange($from, type)

      from = range.from
      to = range.to
    }

    return dispatch(state.tr.removeMark(from, to, type))
  }
}
