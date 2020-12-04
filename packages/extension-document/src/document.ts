import { Node } from '@tiptap/core'

const Document = Node.create({
  name: 'document',
  topNode: true,
  content: 'block+',
})

export default Document

declare module '@tiptap/core' {
  interface AllExtensions {
    Document: typeof Document,
  }
}
