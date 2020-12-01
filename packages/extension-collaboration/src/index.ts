import { Extension } from '@tiptap/core'
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
  defaultOptions: <CollaborationOptions>{
    provider: null,
  },

  addProseMirrorPlugins() {
    return [
      ySyncPlugin(
        this.options.provider.doc.getXmlFragment('prosemirror'),
      ),
      yUndoPlugin(),
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => undo(this.editor.state),
      'Mod-y': () => redo(this.editor.state),
      'Mod-Shift-z': () => redo(this.editor.state),
    }
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
