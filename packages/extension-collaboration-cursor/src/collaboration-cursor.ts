import { Extension } from '@tiptap/core'
import { yCursorPlugin } from 'y-prosemirror'

export interface CollaborationCursorOptions {
  provider: any,
  user: Record<string, any>,
  render (user: Record<string, any>): HTMLElement,
  onUpdate: (users: { clientId: number, [key: string]: any }[]) => null,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collaborationCursor: {
      /**
       * Update details of the current user
       */
      user: (attributes: Record<string, any>) => ReturnType,
    }
  }
}

const awarenessStatesToArray = (states: Map<number, Record<string, any>>) => {
  return Array.from(states.entries()).map(([key, value]) => {
    return {
      clientId: key,
      ...value.user,
    }
  })
}

export const CollaborationCursor = Extension.create<CollaborationCursorOptions>({
  name: 'collaborationCursor',

  addOptions() {
    return {
      provider: null,
      user: {
        name: null,
        color: null,
      },
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
      onUpdate: () => null,
    }
  },

  addCommands() {
    return {
      user: attributes => () => {
        this.options.user = attributes

        this.options.provider.awareness.setLocalStateField('user', this.options.user)

        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      yCursorPlugin((() => {
        this.options.provider.awareness.setLocalStateField('user', this.options.user)

        this.options.provider.awareness.on('change', () => {
          this.options.onUpdate(awarenessStatesToArray(this.options.provider.awareness.states))
        })

        this.options.provider.awareness.on('update', () => {
          this.options.onUpdate(awarenessStatesToArray(this.options.provider.awareness.states))
        })

        this.options.provider.on('status', (event: { status: string }) => {
          if (event.status === 'connected') {
            this.options.provider.awareness.setLocalStateField('user', this.options.user)
          }
        })

        this.options.onUpdate(awarenessStatesToArray(this.options.provider.awareness.states))

        return this.options.provider.awareness
      })(),
      // @ts-ignore
      {
        cursorBuilder: this.options.render,
      }),
    ]
  },
})
