import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export function isNodeEmpty(node: ProseMirrorNode): boolean {
  const defaultContent = node.type.createAndFill(node.attrs)

  if (!defaultContent) {
    return false
  }

  return node.eq(defaultContent)
}
