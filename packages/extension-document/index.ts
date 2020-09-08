import { Node } from '@tiptap/core'

export default new Node()
  .name('document')
  .topNode()
  .schema(() => ({
    content: 'block+',
  }))
  .create()