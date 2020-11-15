import { NodeExtension } from '@tiptap/core'

const Document = NodeExtension.create({
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
