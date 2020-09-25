import { Extension } from '@tiptap/core'
import * as Y from 'yjs'
import {
  redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin,
} from 'y-prosemirror'
import { WebrtcProvider } from 'y-webrtc'
import { keymap } from 'prosemirror-keymap'

export interface YjsOptions {
  name: string,
  color: string,
}

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('example', ydoc)
const type = ydoc.getXmlFragment('prosemirror')

export default new Extension<YjsOptions>()
  .name('yjs')
  .defaults({
    name: 'Someone',
    color: '#cccccc',
  })
  .plugins(({ options }) => [
    ySyncPlugin(type),
    yCursorPlugin((() => {
      provider.awareness.setLocalStateField('user', { name: options.name, color: options.color })

      return provider.awareness
    })()),
    yUndoPlugin(),
    keymap({
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
    }),
  ])
  .create()
