import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export function isNodeEmpty(node: ProseMirrorNode): boolean {
  const defaultContent = node.type.createAndFill()

  if (!defaultContent) {
    return false
  }

  return node.eq(defaultContent)
}
