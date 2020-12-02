import { Extension, Command } from '@tiptap/core'
import {
  redo,
  undo,
  ySyncPlugin,
  yUndoPlugin,
} from 'y-prosemirror'

export interface CollaborationOptions {
  provider: any,
}

const Collaboration = Extension.create({
  name: 'collaboration',

  defaultOptions: <CollaborationOptions>{
    provider: null,
  },

  addCommands() {
    return {
      /**
       * Undo recent changes
       */
      undo: (): Command => ({ state }) => {
        return undo(state)
      },
      /**
       * Reapply reverted changes
       */
      redo: (): Command => ({ state }) => {
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
        this.options.provider.doc.getXmlFragment('prosemirror'),
      ),
      yUndoPlugin(),
    ]
  },

  onDestroy() {
    this.options.provider?.destroy()
  },
})

export default Collaboration

declare module '@tiptap/core' {
  interface AllExtensions {
    Collaboration: typeof Collaboration,
  }
}
