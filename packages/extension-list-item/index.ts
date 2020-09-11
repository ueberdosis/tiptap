import { Node } from '@tiptap/core'

export default new Node()
  .name('list_item')
  .schema(() => ({
    content: 'paragraph block*',
    defining: true,
    draggable: false,
    parseDOM: [
      { tag: 'li' },
    ],
    toDOM: () => ['li', 0],
  }))
  .keys(({ editor, name }) => ({
    Enter: () => editor.splitListItem(name).focus()
    // Tab: () => editor.sinkListItem(name),
    // 'Shift-Tab': () => editor.liftListItem(name),
  }))
  .create()
