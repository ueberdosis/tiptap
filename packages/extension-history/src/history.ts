import { Command, Extension } from '@tiptap/core'
import { history, undo, redo } from 'prosemirror-history'

export interface HistoryOptions {
  depth: number,
  newGroupDelay: number,
}

declare module '@tiptap/core' {
  interface Commands {
    history: {
      /**
       * Undo recent changes
       */
      undo: () => Command,
      /**
       * Reapply reverted changes
       */
      redo: () => Command,
    }
  }
}

export const History = Extension.create<HistoryOptions>({
  name: 'history',

  defaultOptions: {
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
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    }
  },
})
