import { createNode } from '@tiptap/core'

const ListItem = createNode({
  name: 'list_item',

  content: 'paragraph block*',

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
      Enter: () => this.editor.splitListItem('list_item'),
      Tab: () => this.editor.sinkListItem('list_item'),
      'Shift-Tab': () => this.editor.liftListItem('list_item'),
    }
  },
})

export default ListItem

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    ListItem: typeof ListItem,
  }
}
