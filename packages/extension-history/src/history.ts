import { Extension } from '@tiptap/core'
import { history, redo, undo } from '@tiptap/pm/history'

export interface HistoryOptions {
  /**
   * The amount of history events that are collected before the oldest events are discarded.
   * @default 100
   * @example 50
   */
  depth: number,

  /**
   * The delay (in milliseconds) between changes after which a new group should be started.
   * @default 500
   * @example 1000
   */
  newGroupDelay: number,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    history: {
      /**
       * Undo recent changes
       * @example editor.commands.undo()
       */
      undo: () => ReturnType,
      /**
       * Reapply reverted changes
       * @example editor.commands.redo()
       */
      redo: () => ReturnType,
    }
  }
}

/**
 * This extension allows you to undo and redo recent changes.
 * @see https://www.tiptap.dev/api/extensions/history
 *
 * **Important**: If the `@tiptap/extension-collaboration` package is used, make sure to remove
 * the `history` extension, as it is not compatible with the `collaboration` extension.
 *
 * `@tiptap/extension-collaboration` uses its own history implementation.
 */
export const History = Extension.create<HistoryOptions>({
  name: 'history',

  addOptions() {
    return {
      depth: 100,
      newGroupDelay: 500,
    }
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
      'Shift-Mod-z': () => this.editor.commands.redo(),
      'Mod-y': () => this.editor.commands.redo(),

      // Russian keyboard layouts
      'Mod-я': () => this.editor.commands.undo(),
      'Shift-Mod-я': () => this.editor.commands.redo(),
    }
  },
})
