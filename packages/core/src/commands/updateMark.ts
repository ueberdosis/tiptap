import { Editor } from '../Editor'
import { MarkType } from 'prosemirror-model'
import getMarkType from '../utils/getMarkType'
import getMarkRange from '../utils/getMarkRange'

type UpdateMarkCommand = (
  typeOrName: string | MarkType,
  attrs: {},
) => Editor

declare module '../Editor' {
  interface Editor {
    updateMark: UpdateMarkCommand,
  }
}

export default (next: Function, editor: Editor) => (typeOrName: string | MarkType, attrs = {}) => {
  const { view, state, schema } = editor
  const { tr, selection, doc } = state
  let { from, to, $from, empty } = selection
  const type = getMarkType(typeOrName, schema)

  if (empty) {
    const range = getMarkRange($from, type)

    if (range) {
      from = range.from
      to = range.to
    }
  }

  const hasMark = doc.rangeHasMark(from, to, type)

  if (hasMark) {
    tr.removeMark(from, to, type)
  }

  tr.addMark(from, to, type.create(attrs))
  view.dispatch(tr)
  next()
}
