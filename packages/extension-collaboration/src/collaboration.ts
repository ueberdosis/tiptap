import { Extension, Command } from '@tiptap/core'
import {
  redo,
  undo,
  ySyncPlugin,
  yUndoPlugin,
} from 'y-prosemirror'

export interface CollaborationOptions {
  /**
   * An initialized Y.js document.
   */
  document: any,
}

export const Collaboration = Extension.create({
  name: 'collaboration',

  defaultOptions: <CollaborationOptions>{
    document: null,
  },

  addCommands() {
    return {
      /**
       * Undo recent changes
       */
      undo: (): Command => ({ tr, state }) => {
        tr.setMeta('preventDispatch', true)

        return undo(state)
      },
      /**
       * Reapply reverted changes
       */
      redo: (): Command => ({ tr, state }) => {
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
    return [
      ySyncPlugin(
        this.options.document.getXmlFragment('prosemirror'),
      ),
      yUndoPlugin(),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Collaboration: typeof Collaboration,
  }
}
