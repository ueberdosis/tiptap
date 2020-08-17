import { Editor } from '../Editor'
import { toggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import getMarkType from '../utils/getMarkType'

type ToggleMarkCommand = (typeOrName: string | MarkType) => Editor

declare module '../Editor' {
  interface Editor {
    toggleMark: ToggleMarkCommand,
  }
}

export default (next: Function, editor: Editor) => (typeOrName: string | MarkType) => {
  const { view, state, schema } = editor
  const type = getMarkType(typeOrName, schema)

  toggleMark(type)(state, view.dispatch)
  next()
}
