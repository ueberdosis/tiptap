import { Node, mergeAttributes } from '@tiptap/core'

export interface ListItemOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const ListItem = Node.create({
  name: 'listItem',

  defaultOptions: <ListItemOptions>{
    HTMLAttributes: {},
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

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem('listItem'),
      Tab: () => this.editor.commands.sinkListItem('listItem'),
      'Shift-Tab': () => this.editor.commands.liftListItem('listItem'),
    }
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    ListItem: typeof ListItem,
  }
}
