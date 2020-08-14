import { Editor } from '../Editor'

type ClearContent = (emitUpdate?: Boolean) => any

declare module '../Editor' {
  interface Editor {
    clearContent: ClearContent,
  }
}

export default (next: Function, editor: Editor): ClearContent => (emitUpdate = false) => {
  editor.setContent('', emitUpdate)
  next()
}
