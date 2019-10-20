import { getMarkRange } from 'tiptap-utils'

export default function (type) {
  return (state, dispatch) => {
    const { tr, selection } = state
    let { from, to } = selection
    const { $from, empty } = selection

    if (empty) {
      const range = getMarkRange($from, type)

      from = range.from
      to = range.to
    }

    tr.removeMark(from, to, type)

    return dispatch(tr)
  }
}
