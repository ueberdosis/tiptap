import { Node } from '@tiptap/core'

export const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: 'block+',
})
