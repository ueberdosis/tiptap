import { Extension } from '@tiptap/core'
import {
  redo, undo, ySyncPlugin, yUndoPlugin,
} from 'y-prosemirror'
import { keymap } from 'prosemirror-keymap'

export interface CollaborationOptions {
  provider: any,
  type: any,
}

export default new Extension<CollaborationOptions>()
  .name('collaboration')
  .defaults({
    provider: null,
    type: null,
  })
  .plugins(({ options }) => [
    ySyncPlugin(options.type),
    yUndoPlugin(),
    keymap({
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
    }),
  ])
  .create()
