import { Extension, CommandSpec } from '@tiptap/core'
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
    redo(): Editor,
  }
}

export default class History extends Extension {

  name = 'history'

  commands(): CommandSpec {
    return {
      undo: (next, { view }) => {
        undo(view.state, view.dispatch)
        next()
      },
      redo: (next, { view }) => {
        redo(view.state, view.dispatch)
        next()
      },
    }
  }

  keys() {
    return {
      'Mod-z': () => this.editor.undo(),
      'Mod-y': () => this.editor.redo(),
      'Shift-Mod-z': () => this.editor.redo(),
    }
  }

  plugins() {
    return [
      history()
    ]
  }

}