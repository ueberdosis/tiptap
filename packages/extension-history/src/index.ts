import { Command, createExtension } from '@tiptap/core'
import { history, undo, redo } from 'prosemirror-history'

export interface HistoryOptions {
  depth: number,
  newGroupDelay: number,
}

const History = createExtension({
  defaultOptions: <HistoryOptions>{
    depth: 100,
    newGroupDelay: 500,
  },

  addCommands() {
    return {
      undo: (): Command => ({ state, dispatch }) => {
        return undo(state, dispatch)
      },
      redo: (): Command => ({ state, dispatch }) => {
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

export default History

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    History: typeof History,
  }
}
