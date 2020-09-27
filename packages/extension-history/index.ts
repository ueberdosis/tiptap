import { Command, Extension } from '@tiptap/core'
import {
  history,
  undo,
  redo,
} from 'prosemirror-history'

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    undo: () => Command,
    redo: () => Command,
  }
}

export interface HistoryOptions {
  depth: number,
  newGroupDelay: number,
}

export default new Extension<HistoryOptions>()
  .name('history')
  .defaults({
    depth: 100,
    newGroupDelay: 500,
  })
  .commands(() => ({
    undo: () => ({ state, dispatch }) => {
      return undo(state, dispatch)
    },
    redo: () => ({ state, dispatch }) => {
      return redo(state, dispatch)
    },
  }))
  .keys(({ editor }) => ({
    'Mod-z': () => editor.undo(),
    'Mod-y': () => editor.redo(),
    'Shift-Mod-z': () => editor.redo(),
  }))
  .plugins(({ options }) => [
    history(options),
  ])
  .create()
