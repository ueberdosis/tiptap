import { Editor } from '../Editor'
import { MarkType } from 'prosemirror-model'
import getMarkType from '../utils/getMarkType'
import getMarkRange from '../utils/getMarkRange'

type RemoveMark = (type: string | MarkType) => any

declare module '../Editor' {
  interface Editor {
    toggleMark: RemoveMark,
  }
}

export default (next: Function, editor: Editor): RemoveMark => typeOrName => {
  const { view, state, schema } = editor
  const { tr, selection } = state
  const type = getMarkType(typeOrName, schema)
  let { from, to, $from, empty } = selection

  if (empty) {
    const range = getMarkRange($from, type)

    if (range) {
      from = range.from
      to = range.to
    }
  }

  tr.removeMark(from, to, type)
  view.dispatch(tr)
  next()
}
