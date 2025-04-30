import { Extension } from '@tiptap/core'

import { handleBackspace, handleDelete } from './listHelpers/index.js'

export type ListKeymapOptions = {
  /**
   * An array of list types. This is used for item and wrapper list matching.
   * @default []
   * @example [{ itemName: 'listItem', wrapperNames: ['bulletList', 'orderedList'] }]
   */
  listTypes: Array<{
    itemName: string
    wrapperNames: string[]
  }>
}

/**
 * This extension registers custom keymaps to change the behaviour of the backspace and delete keys.
 * By default Prosemirror keyhandling will always lift or sink items so paragraphs are joined into
 * the adjacent or previous list item. This extension will prevent this behaviour and instead will
 * try to join paragraphs from two list items into a single list item.
 * @see https://www.tiptap.dev/api/extensions/list-keymap
 */
export const ListKeymap = Extension.create<ListKeymapOptions>({
  name: 'listKeymap',

  addOptions() {
    return {
      listTypes: [
        {
          itemName: 'listItem',
          wrapperNames: ['bulletList', 'orderedList'],
        },
        {
          itemName: 'taskItem',
          wrapperNames: ['taskList'],
        },
      ],
    }
  },

  addKeyboardShortcuts() {
    return {
      Delete: ({ editor }) => {
        let handled = false

        this.options.listTypes.forEach(({ itemName }) => {
          if (editor.state.schema.nodes[itemName] === undefined) {
            return
          }

          if (handleDelete(editor, itemName)) {
            handled = true
          }
        })

        return handled
      },
      'Mod-Delete': ({ editor }) => {
        let handled = false

        this.options.listTypes.forEach(({ itemName }) => {
          if (editor.state.schema.nodes[itemName] === undefined) {
            return
          }

          if (handleDelete(editor, itemName)) {
            handled = true
          }
        })

        return handled
      },
      Backspace: ({ editor }) => {
        let handled = false

        this.options.listTypes.forEach(({ itemName, wrapperNames }) => {
          if (editor.state.schema.nodes[itemName] === undefined) {
            return
          }

          if (handleBackspace(editor, itemName, wrapperNames)) {
            handled = true
          }
        })

        return handled
      },
      'Mod-Backspace': ({ editor }) => {
        let handled = false

        this.options.listTypes.forEach(({ itemName, wrapperNames }) => {
          if (editor.state.schema.nodes[itemName] === undefined) {
            return
          }

          if (handleBackspace(editor, itemName, wrapperNames)) {
            handled = true
          }
        })

        return handled
      },
    }
  },
})
