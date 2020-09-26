import { Extension } from '@tiptap/core'
import { yCursorPlugin } from 'y-prosemirror'

export interface CollaborationCursorOptions {
  name: string,
  color: string,
  provider: any,
}

export default new Extension<CollaborationCursorOptions>()
  .name('collaboration_cursor')
  .defaults({
    provider: null,
    name: 'Someone',
    color: '#cccccc',
  })
  .plugins(({ options }) => [
    yCursorPlugin((() => {
      options.provider.awareness.setLocalStateField('user', {
        name: options.name,
        color: options.color,
      })

      return options.provider.awareness
    })()),
  ])
  .create()
