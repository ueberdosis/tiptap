import { Extension } from '@tiptap/core'
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

export interface HistoryOptions {
  historyPluginOptions: Object,
}

export default new Extension<HistoryOptions>()
  .name('history')
  .defaults({
    historyPluginOptions: {},
  })
  .commands(() => ({
    undo: (next, { view }) => () => {
      undo(view.state, view.dispatch)
      next()
    },
    redo: (next, { view }) => () => {
      redo(view.state, view.dispatch)
      next()
    },
  }))
  .keys(({ editor }) => ({
    'Mod-z': () => editor.undo(),
    'Mod-y': () => editor.redo(),
    'Shift-Mod-z': () => editor.redo(),
  }))
  .plugins(({ options }) => [
    history(options.historyPluginOptions)
  ])
  .create()
