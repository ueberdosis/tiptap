import {
  isAtStartOfNode, isNodeActive, istAtEndOfNode, mergeAttributes, Node,
} from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model'

import { joinListItemBackward } from './commands/joinListItemBackward'
import { joinListItemForward } from './commands/joinListItemForward'
import {
  findListItemPos, hasListItemBefore, listItemHasSubList, nextListIsDeeper, nextListIsHigher,
} from './helpers'

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
      Delete: ({ editor }) => {
        // if the cursor is not inside the current node type
        // do nothing and proceed
        if (!isNodeActive(editor.state, this.name)) {
          return false
        }

        // if the cursor is not at the end of a node
        // do nothing and proceed
        if (!istAtEndOfNode(editor.state)) {
          return false
        }

        // check if the next node is a list with a deeper depth
        if (nextListIsDeeper(this.name, editor.state)) {
          return editor
            .chain()
            .focus(editor.state.selection.from + 4)
            .lift(this.name)
            .joinBackward()
            .run()
        }

        if (nextListIsHigher(this.name, editor.state)) {
          return editor.chain()
            .joinForward()
            .joinBackward()
            .run()
        }

        // check if the next node is also a listItem
        return editor.commands.joinListItemForward(this.name)
      },
      Backspace: ({ editor }) => {
        // this is required to still handle the undo handling
        if (this.editor.commands.undoInputRule()) {
          return true
        }

        // if the cursor is not inside the current node type
        // do nothing and proceed
        if (!isNodeActive(editor.state, this.name)) {
          return false
        }

        // if the cursor is not at the start of a node
        // do nothing and proceed
        if (!isAtStartOfNode(editor.state)) {
          return false
        }

        const listItemPos = findListItemPos(this.name, editor.state)

        if (!listItemPos) {
          return false
        }

        const $prev = editor.state.doc.resolve(listItemPos.$pos.pos - 2)
        const prevNode = $prev.node(listItemPos.depth)

        const previousListItemHasSubList = listItemHasSubList(this.name, editor.state, prevNode)

        // if the previous item is a list item and doesn't have a sublist, join the list items
        if (hasListItemBefore(this.name, editor.state) && !previousListItemHasSubList) {
          return editor.commands.joinListItemBackward(this.name)
        }

        // otherwise in the end, a backspace should
        // always just lift the list item if
        // joining / merging is not possible
        return editor.chain().liftListItem(this.name).run()
      },
    }
  },
})
