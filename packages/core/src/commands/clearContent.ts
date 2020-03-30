import { Editor } from '../Editor'
import { TextSelection } from 'prosemirror-state'

declare module '../Editor' {
  interface Editor {
    clearContent(emitUpdate?: Boolean): Editor,
  }
}

export default function clearContent(next: Function, editor: Editor, emitUpdate = false): void {
  editor.setContent('', emitUpdate)
  next()
}
