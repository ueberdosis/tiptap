import { Extension, Command } from '@tiptap/core'
import { yCursorPlugin } from 'y-prosemirror'

export interface CollaborationCursorOptions {
  name: string,
  color: string,
  provider: any,
  render (user: { name: string, color: string }): HTMLElement,
}

export type UserCommand = (attributes: {
  name: string,
  color: string,
}) => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    user: UserCommand,
  }
}

export default new Extension<CollaborationCursorOptions>()
  .name('collaboration_cursor')
  .commands(({ options }) => ({
    user: attributes => () => {
      options.provider.awareness.setLocalStateField('user', attributes)

      return true
    },
  }))
  .defaults({
    provider: null,
    name: 'Someone',
    color: '#cccccc',
    render: user => {
      const cursor = document.createElement('span')
      cursor.classList.add('collaboration-cursor__caret')
      cursor.setAttribute('style', `border-color: ${user.color}`)

      const label = document.createElement('div')
      label.classList.add('collaboration-cursor__label')
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
