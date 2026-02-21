import { Extension } from '@tiptap/core'
import type { DecorationAttrs } from '@tiptap/pm/view'
import { defaultSelectionBuilder, yCursorPlugin } from '@tiptap/y-tiptap'

type CollaborationCaretStorage = {
  users: { clientId: number; [key: string]: any }[]
}

export interface CollaborationCaretOptions {
  /**
   * The Hocuspocus provider instance. This can also be a TiptapCloudProvider instance.
   * @type {HocuspocusProvider | TiptapCloudProvider}
   * @example new HocuspocusProvider()
   */
  provider: any

  /**
   * The user details object – feel free to add properties to this object as needed
   * @example { name: 'John Doe', color: '#305500' }
   */
  user: Record<string, any>

  /**
   * A function that returns a DOM element for the cursor.
   * @param user The user details object
   * @param clientId The user client id
   * @example
   * render: user => {
   *  const cursor = document.createElement('span')
   *  cursor.classList.add('collaboration-carets__caret')
   *  cursor.setAttribute('style', `border-color: ${user.color}`)
   *
   *  const label = document.createElement('div')
   *  label.classList.add('collaboration-carets__label')
   *  label.setAttribute('style', `background-color: ${user.color}`)
   *  label.insertBefore(document.createTextNode(user.name), null)
   *
   *  cursor.insertBefore(label, null)
   *  return cursor
   * }
   */
  render(user: Record<string, any>, clientId: number): HTMLElement

  /**
   * A function that returns a ProseMirror DecorationAttrs object for the selection.
   * @param user The user details object
   * @param clientId The user client id
   * @example
   * selectionRender: user => {
   * return {
   *  nodeName: 'span',
   *  class: 'collaboration-carets__selection',
   *  style: `background-color: ${user.color}`,
   *  'data-user': user.name,
   * }
   */
  selectionRender(user: Record<string, any>, clientId: number): DecorationAttrs

  /**
   * @deprecated The "onUpdate" option is deprecated. Please use `editor.storage.collaborationCaret.users` instead. Read more: https://tiptap.dev/api/extensions/collaboration-caret
   */
  onUpdate: (users: { clientId: number; [key: string]: any }[]) => null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collaborationCaret: {
      /**
       * Update details of the current user
       * @example editor.commands.updateUser({ name: 'John Doe', color: '#305500' })
       */
      updateUser: (attributes: Record<string, any>) => ReturnType
      /**
       * Update details of the current user
       *
       * @deprecated The "user" command is deprecated. Please use "updateUser" instead. Read more: https://tiptap.dev/api/extensions/collaboration-caret
       */
      user: (attributes: Record<string, any>) => ReturnType
    }
  }

  interface Storage {
    collaborationCaret: CollaborationCaretStorage
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

const defaultOnUpdate = () => null

/**
 * This extension allows you to add collaboration carets to your editor.
 * @see https://tiptap.dev/api/extensions/collaboration-caret
 */
export const CollaborationCaret = Extension.create<CollaborationCaretOptions, CollaborationCaretStorage>({
  name: 'collaborationCaret',

  priority: 999,

  addOptions() {
    return {
      provider: null,
      user: {
        name: null,
        color: null,
      },
      render: user => {
        const cursor = document.createElement('span')

        cursor.classList.add('collaboration-carets__caret')
        cursor.setAttribute('style', `border-color: ${user.color}`)

        const label = document.createElement('div')

        label.classList.add('collaboration-carets__label')
        label.setAttribute('style', `background-color: ${user.color}`)
        label.insertBefore(document.createTextNode(user.name), null)
        cursor.insertBefore(label, null)

        return cursor
      },
      selectionRender: defaultSelectionBuilder,
      onUpdate: defaultOnUpdate,
    }
  },

  onCreate() {
    if (this.options.onUpdate !== defaultOnUpdate) {
      console.warn(
        '[tiptap warn]: DEPRECATED: The "onUpdate" option is deprecated. Please use `editor.storage.collaborationCaret.users` instead. Read more: https://tiptap.dev/api/extensions/collaboration-caret',
      )
    }
    if (!this.options.provider) {
      throw new Error('The "provider" option is required for the CollaborationCaret extension')
    }
  },

  addStorage() {
    return {
      users: [],
    }
  },

  addCommands() {
    return {
      updateUser: attributes => () => {
        this.options.provider.awareness.setLocalStateField('user', attributes)
        return true
      },
      user:
        attributes =>
        ({ editor }) => {
          console.warn(
            '[tiptap warn]: DEPRECATED: The "user" command is deprecated. Please use "updateUser" instead. Read more: https://tiptap.dev/api/extensions/collaboration-caret',
          )

          return editor.commands.updateUser(attributes)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      yCursorPlugin(
        (() => {
          this.options.provider.awareness.setLocalStateField('user', this.options.user)

          this.storage.users = awarenessStatesToArray(this.options.provider.awareness.states)

          this.options.provider.awareness.on('update', () => {
            this.storage.users = awarenessStatesToArray(this.options.provider.awareness.states)
          })

          return this.options.provider.awareness
        })(),
        {
          cursorBuilder: this.options.render,
          selectionBuilder: this.options.selectionRender,
        },
      ),
    ]
  },
})
