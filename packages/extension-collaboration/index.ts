import { createExtension } from '@tiptap/core'
import {
  redo, undo, ySyncPlugin, yUndoPlugin,
} from 'y-prosemirror'

export interface CollaborationOptions {
  provider: any,
  type: any,
}

export default createExtension({
  name: 'collaboration',

  defaultOptions: <CollaborationOptions>{
    provider: null,
    type: null,
  },

  addProseMirrorPlugins() {
    return [
      ySyncPlugin(this.options.type),
      yUndoPlugin(),
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
    }
  },
})
