import { createNode } from '@tiptap/core'

export default createNode({
  name: 'list_item',

  content: 'paragraph block*',

  defining: true,

  parseHTML() {
    return [
      { tag: 'li' },
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
