import { Node } from '@tiptap/core'

/**
 * The default document node which represents the top level node of the editor.
 * @see https://tiptap.dev/api/nodes/document
 */
export const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: 'block+',
})
