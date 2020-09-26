import { Extension } from '@tiptap/core'
import * as Y from 'yjs'
import {
  redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin,
} from 'y-prosemirror'
import { WebrtcProvider } from 'y-webrtc'
import { keymap } from 'prosemirror-keymap'

export interface CollaborationOptions {
  name: string,
  color: string,
  provider?: any,
  type?: any,
}

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('example', ydoc)
const type = ydoc.getXmlFragment('prosemirror')

export default new Extension<CollaborationOptions>()
  .name('collaboration')
  .defaults({
    name: 'Someone',
    color: '#cccccc',
    provider: null,
    type: null,
  })
  .plugins(({ options }) => [
    // Collaboration
    ySyncPlugin(type),
    yUndoPlugin(),
    keymap({
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
    }),

    // CollaborationCursor
    yCursorPlugin((() => {
      provider.awareness.setLocalStateField('user', { name: options.name, color: options.color })

      return provider.awareness
    })()),
  ])
  .create()
