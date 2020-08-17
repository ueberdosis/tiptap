import { Editor } from '../Editor'
import { MarkType } from 'prosemirror-model'
import getMarkType from '../utils/getMarkType'
import getMarkRange from '../utils/getMarkRange'

type RemoveMarkCommand = (typeOrName: string | MarkType) => Editor

declare module '../Editor' {
  interface Editor {
    toggleMark: RemoveMarkCommand,
  }
}

export default (next: Function, editor: Editor) => (typeOrName: string | MarkType) => {
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
