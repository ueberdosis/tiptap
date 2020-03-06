import Editor, { Extension } from '@tiptap/core'
import {
  history,
  undo,
  redo,
  undoDepth,
  redoDepth,
} from 'prosemirror-history'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    undo(): Editor,
  }
}

export default class History extends Extension {

  name = 'history'

  init() {
    // @ts-ignore
    this.editor.registerCommand('undo', (next, { view }) => {
      undo(view.state, view.dispatch)
      next()
    })
  }

  get plugins() {
    return [
      history()
    ]
  }

  // commands() {
  //   return {
  //     undo: () => undo,
  //     redo: () => redo,
  //     undoDepth: () => undoDepth,
  //     redoDepth: () => redoDepth,
  //   }
  // }

}