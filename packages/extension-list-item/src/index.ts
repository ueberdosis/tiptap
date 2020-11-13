import { createNode } from '@tiptap/core'

const ListItem = createNode({
  name: 'listItem',

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

declare module '@tiptap/core' {
  interface AllExtensions {
    ListItem: typeof ListItem,
  }
}
