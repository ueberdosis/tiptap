import { createNode } from '@tiptap/core'

export default createNode({
  name: 'document',
  topNode: true,
  content: 'block+',
})
