import { Editor } from '../Editor'

type ClearContentCommand = (emitUpdate?: Boolean) => Editor

declare module '../Editor' {
  interface Editor {
    clearContent: ClearContentCommand,
  }
}

export default (next: Function, editor: Editor) => (emitUpdate = false) => {
  editor.setContent('', emitUpdate)
  next()
}
