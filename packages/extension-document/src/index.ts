import { createNode } from '@tiptap/core'

const Document = createNode({
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
