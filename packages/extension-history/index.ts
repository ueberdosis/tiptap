import { Command, createExtension } from '@tiptap/core'
import {
  history,
  undo,
  redo,
} from 'prosemirror-history'

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     undo: () => Command,
//     redo: () => Command,
//   }
// }

export interface HistoryOptions {
  depth: number,
  newGroupDelay: number,
}

export default createExtension({
  name: 'history',

  defaultOptions: <HistoryOptions>{
    depth: 100,
    newGroupDelay: 500,
  },

  addCommands() {
    return {
      undo: () => ({ state, dispatch }) => {
        return undo(state, dispatch)
      },
      redo: () => ({ state, dispatch }) => {
        return redo(state, dispatch)
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      history(this.options),
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.undo(),
      'Mod-y': () => this.editor.redo(),
      'Shift-Mod-z': () => this.editor.redo(),
    }
  },
})
