import { mergeAttributes, Node } from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model'

import { joinListItemBackward } from './commands/joinListItemBackward'
import { joinListItemForward } from './commands/joinListItemForward'
import { hasPreviousListItem, isAtStartOfNode, isNodeAtCursor } from './helpers'

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
      Backspace: ({ editor }) => {
        if (!isNodeAtCursor(this.name, editor.state)) {
          return false
        }

        if (!isAtStartOfNode(editor.state)) {
          return false
        }

        // check if the current list item has
        // a previous list item on the same depth
        console.log(hasPreviousListItem(this.name, editor.state))
        if (hasPreviousListItem(this.name, editor.state)) {
          return editor.commands.joinListItemBackward(this.name)
        }

        return editor.chain().liftListItem(this.name).run()
      },
    }
  },
})
