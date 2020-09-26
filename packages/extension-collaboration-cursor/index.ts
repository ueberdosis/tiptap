import { Extension } from '@tiptap/core'
import { yCursorPlugin } from 'y-prosemirror'

export interface CollaborationCursorOptions {
  name: string,
  color: string,
  provider: any,
  render (user: { name: string, color: string }): HTMLElement,
}

export default new Extension<CollaborationCursorOptions>()
  .name('collaboration_cursor')
  .defaults({
    provider: null,
    name: 'Someone',
    color: '#cccccc',
    render: user => {
      const cursor = document.createElement('span')
      cursor.classList.add('collaboration-cursor')
      cursor.setAttribute('style', `border-color: ${user.color}`)

      const label = document.createElement('div')
      label.setAttribute('style', `background-color: ${user.color}`)
      label.insertBefore(document.createTextNode(user.name), null)
      cursor.insertBefore(label, null)

      return cursor
    },
  })
  .plugins(({ options }) => [
    yCursorPlugin((() => {
      options.provider.awareness.setLocalStateField('user', {
        name: options.name,
        color: options.color,
      })

      return options.provider.awareness
    })(),
    // @ts-ignore
    {
      cursorBuilder: options.render,
    }),
  ])
  .create()
