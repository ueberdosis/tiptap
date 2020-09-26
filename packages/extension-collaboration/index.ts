import { Extension } from '@tiptap/core'
import {
  redo, undo, ySyncPlugin, yUndoPlugin,
} from 'y-prosemirror'

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
  ])
  .keys(() => {
    return {
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
    }
  })
  .create()
