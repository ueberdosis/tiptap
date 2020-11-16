import { Node } from '@tiptap/core'

export interface ListItemOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

const ListItem = Node.create({
  name: 'listItem',

  defaultOptions: <ListItemOptions>{
    HTMLAttributes: {},
  },

  content: '(paragraph|list?)+',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'li',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', HTMLAttributes, 0]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem('listItem'),
      Tab: () => this.editor.commands.sinkListItem('listItem'),
      'Shift-Tab': () => this.editor.commands.liftListItem('listItem'),
    }
  },
})

export default ListItem

declare global {
  namespace Tiptap {
    interface AllExtensions {
      ListItem: typeof ListItem,
    }
  }
}
