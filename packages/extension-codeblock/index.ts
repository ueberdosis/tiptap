import { Node } from '@tiptap/core'

export default new Node()
  .name('code_block')
  .schema(() => ({
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    draggable: false,
    parseDOM: [
      { tag: 'pre', preserveWhitespace: 'full' },
    ],
    toDOM: () => ['pre', ['code', 0]],
  }))
  .create()
