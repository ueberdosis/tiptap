import { Command, Extension } from '@tiptap/core'
import { history, undo, redo } from 'prosemirror-history'

export interface HistoryOptions {
  depth: number,
  newGroupDelay: number,
}

declare module '@tiptap/core' {
  interface Commands {
    undo: () => Command,
    redo: () => Command,
  }
}

export const History = Extension.create({
  name: 'history',

  defaultOptions: <HistoryOptions>{
    depth: 100,
    newGroupDelay: 500,
  },

  addCommands() {
    return {
      /**
       * Undo recent changes
       */
      undo: () => ({ state, dispatch }) => {
        return undo(state, dispatch)
      },
      /**
       * Reapply reverted changes
       */
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
