import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
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
  render(user: Record<string, any>): HTMLElement

  /**
   * A function that returns a ProseMirror DecorationAttrs object for the selection.
   * @param user The user details object
   * @example
   * selectionRender: user => {
   * return {
   *  nodeName: 'span',
   *  class: 'collaboration-carets__selection',
   *  style: `background-color: ${user.color}`,
   *  'data-user': user.name,
   * }
   */
  selectionRender(user: Record<string, any>): DecorationAttrs

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

const awarenessStatesToArray = (states: Map<number, Record<string, any> | null | undefined>) => {
  return Array.from(states.entries()).map(([key, value]) => {
    if (value && value.user) {
      return {
        clientId: key,
        ...value.user,
      }
    }
    return {
      clientId: key,
    }
  })
}

const defaultOnUpdate = () => null

/**
 * This extension allows you to add collaboration carets to your editor.
 * @see https://tiptap.dev/api/extensions/collaboration-caret
 */
export const CollaborationCaret = Extension.create<
  CollaborationCaretOptions,
  CollaborationCaretStorage
>({
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
    const { provider } = this.options
    const storage = this.storage
    const user = this.options.user

    // Owns the awareness 'update' subscription so it's torn down when the editor
    // is destroyed. Without this, the listener would keep the editor reachable
    // from a shared provider's awareness emitter and leak memory across editors.
    const awarenessListenerPlugin = new Plugin({
      key: new PluginKey('collaborationCaretAwarenessListener'),
      view: () => {
        const onAwarenessUpdate = () => {
          storage.users = awarenessStatesToArray(provider.awareness.states)
        }

        provider.awareness.setLocalStateField('user', user)
        storage.users = awarenessStatesToArray(provider.awareness.states)
        provider.awareness.on('update', onAwarenessUpdate)

        return {
          destroy: () => {
            provider.awareness.off('update', onAwarenessUpdate)
            storage.users = []
          },
        }
      },
    })

    return [
      awarenessListenerPlugin,
      yCursorPlugin(provider.awareness, {
        cursorBuilder: this.options.render,
        selectionBuilder: this.options.selectionRender,
      }),
    ]
  },
})
