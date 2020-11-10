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

  renderHTML({ attributes }) {
    return ['li', attributes, 0]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.splitListItem('listItem'),
      Tab: () => this.editor.sinkListItem('listItem'),
      'Shift-Tab': () => this.editor.liftListItem('listItem'),
    }
  },
})

export default ListItem

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    ListItem: typeof ListItem,
  }
}
