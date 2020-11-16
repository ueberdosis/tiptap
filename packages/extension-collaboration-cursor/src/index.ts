import { Extension, Command } from '@tiptap/core'
import { yCursorPlugin } from 'y-prosemirror'

export interface CollaborationCursorOptions {
  name: string,
  color: string,
  provider: any,
  render (user: { name: string, color: string }): HTMLElement,
}

const CollaborationCursor = Extension.create({
  defaultOptions: <CollaborationCursorOptions>{
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
  },

  addCommands() {
    return {
      /**
       * Update details of the current user
       */
      user: (attributes: {
        name: string,
        color: string,
      }): Command => () => {
        this.options.provider.awareness.setLocalStateField('user', attributes)

        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      yCursorPlugin((() => {
        this.options.provider.awareness.setLocalStateField('user', {
          name: this.options.name,
          color: this.options.color,
        })

        return this.options.provider.awareness
      })(),
      // @ts-ignore
      {
        cursorBuilder: this.options.render,
      }),
    ]
  },
})

export default CollaborationCursor

declare module '@tiptap/core' {
  interface AllExtensions {
    CollaborationCursor: typeof CollaborationCursor,
  }
}
