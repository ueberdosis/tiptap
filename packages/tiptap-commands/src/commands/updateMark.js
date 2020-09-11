import { getMarkRange } from 'tiptap-utils'

export default function (type, attrs) {
  return (state, dispatch) => {
    const {
      tr,
      selection,
      doc,
    } = state

    const {
      ranges,
      empty,
    } = selection

    if (empty) {
      const { from, to } = getMarkRange(selection.$from, type)
      if (doc.rangeHasMark(from, to, type)) {
        tr.removeMark(from, to, type)
      }

      tr.addMark(from, to, type.create(attrs))
    } else {
      ranges.forEach(ref$1 => {
        const { $to, $from } = ref$1

        if (doc.rangeHasMark($from.pos, $to.pos, type)) {
          tr.removeMark($from.pos, $to.pos, type)
        }

        tr.addMark($from.pos, $to.pos, type.create(attrs))
      })
    }

    return dispatch(tr)
  }
}
