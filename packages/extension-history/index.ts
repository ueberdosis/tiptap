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
    undo(): Editor,
  }
}

export default class History extends Extension {

  name = 'history'

  created() {
    this.editor.registerCommand('undo', (next, { view }) => {
      undo(view.state, view.dispatch)
      next()
    })

    this.editor.registerCommand('redo', (next, { view }) => {
      redo(view.state, view.dispatch)
      next()
    })
  }

  plugins() {
    return [
      history()
    ]
  }

  // commands() {
  //   return {
  //     undo: (next, { view }) => {
  //       undo(view.state, view.dispatch)
  //       next()
  //     },
  //     redo: (next, { view }) => {
  //       redo(view.state, view.dispatch)
  //       next()
  //     },
  //     // undoDepth: () => undoDepth,
  //     // redoDepth: () => redoDepth,
  //   }
  // }

}