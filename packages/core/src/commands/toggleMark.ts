import { Editor } from '../Editor'
import { toggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import getMarkType from '../utils/getMarkType'

type ToggleMark = (type: string | MarkType) => any

declare module '../Editor' {
  interface Editor {
    toggleMark: ToggleMark,
  }
}

export default (next: Function, editor: Editor): ToggleMark => (typeOrName) => {
  const { view, state, schema } = editor
  const type = getMarkType(typeOrName, schema)

  toggleMark(type)(state, view.dispatch)
  next()
}
