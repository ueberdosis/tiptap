import { Extension } from '@tiptap/core'
import {
  redo, undo, ySyncPlugin, yUndoPlugin,
} from 'y-prosemirror'

export interface CollaborationOptions {
  provider: any,
  type: any,
}

const Collaboration = Extension.create({
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

export default Collaboration

declare module '@tiptap/core' {
  interface AllExtensions {
    Collaboration: typeof Collaboration,
  }
}
