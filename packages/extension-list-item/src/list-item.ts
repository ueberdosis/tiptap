import {
  mergeAttributes, Node,
} from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model'

import { joinListItemBackward } from './commands/joinListItemBackward.js'
import { joinListItemForward } from './commands/joinListItemForward.js'
import { handleBackspace } from './handlers/handleBackspace.js'
import { handleDelete } from './handlers/handleDelete.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    listItem: {
      /**
       * Lift the list item into a wrapping list.
       */
      joinListItemForward: (typeOrName: string | NodeType) => ReturnType
      joinListItemBackward: (typeOrName: string | NodeType) => ReturnType
    }
  }
}

export interface ListItemOptions {
  HTMLAttributes: Record<string, any>,
}

export const ListItem = Node.create<ListItemOptions>({
  name: 'listItem',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'paragraph block*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'li',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      joinListItemForward,
      joinListItemBackward,
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
      Delete: ({ editor }) => handleDelete(editor, this.name),
      'Mod-Delete': ({ editor }) => handleDelete(editor, this.name),
      Backspace: ({ editor }) => handleBackspace(editor, this.name),
      'Mod-Backspace': ({ editor }) => handleBackspace(editor, this.name),
    }
  },
})
