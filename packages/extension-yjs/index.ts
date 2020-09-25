import { Extension } from '@tiptap/core'
import { keymap } from 'prosemirror-keymap'
import {
  redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin,
} from 'y-prosemirror'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('tiptap', ydoc)
const type = ydoc.getXmlFragment('prosemirror')

export default new Extension()
  .name('yjs')
  .plugins(() => {
    return [
      ySyncPlugin(type),
      yCursorPlugin(provider.awareness),
      yUndoPlugin(),
      keymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Mod-Shift-z': redo,
      }),
    ]
  })
  .create()
