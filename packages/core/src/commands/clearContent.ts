import { Editor } from '../Editor'
import { TextSelection } from 'prosemirror-state'

type ClearContent = (emitUpdate?: Boolean) => any

declare module '../Editor' {
  interface Editor {
    clearContent: ClearContent,
  }
}

export default (next: Function, editor: Editor, emitUpdate = false): ClearContent => emitUpdate => {
  editor.setContent('', emitUpdate)
  next()
}
