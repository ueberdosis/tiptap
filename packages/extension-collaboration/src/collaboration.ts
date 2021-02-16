import { Extension, Command } from '@tiptap/core'
import {
  redo,
  undo,
  ySyncPlugin,
  yUndoPlugin,
} from 'y-prosemirror'

declare module '@tiptap/core' {
  interface AllCommands {
    collaboration: {
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

export interface CollaborationOptions {
  /**
   * An initialized Y.js document.
   */
  document: any,
  /**
   * Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.
   */
  field: string,
  /**
   * A raw Y.js fragment, can be used instead of `document` and `field`.
   */
  fragment: any,
}

export const Collaboration = Extension.create<CollaborationOptions>({
  name: 'collaboration',

  defaultOptions: {
    document: null,
    field: 'default',
    fragment: null,
  },

  addCommands() {
    return {
      undo: () => ({ tr, state }) => {
        tr.setMeta('preventDispatch', true)

        return undo(state)
      },
      redo: () => ({ tr, state }) => {
        tr.setMeta('preventDispatch', true)

        return redo(state)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    }
  },

  addProseMirrorPlugins() {
    const fragment = this.options.fragment
      ? this.options.fragment
      : this.options.document.getXmlFragment(this.options.field)

    return [
      ySyncPlugin(fragment),
      yUndoPlugin(),
    ]
  },
})
